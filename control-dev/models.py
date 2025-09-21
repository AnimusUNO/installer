"""
SQLAlchemy models for Sanctum UI database
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
import os

# Database configuration
DB_PATH = os.path.join(os.path.dirname(__file__), 'db', 'animus_ui.db')
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create engine and session
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

class User(Base):
    """User model for authentication and authorization"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, index=True)  # 'admin', 'user', 'viewer'
    permissions = Column(JSON)  # User-specific permissions
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True, index=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime)
    
    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    created_agents = relationship("Agent", back_populates="creator", foreign_keys="Agent.created_by")

class UserSession(Base):
    """User session model for web interface authentication"""
    __tablename__ = "user_sessions"
    
    id = Column(String(100), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_token = Column(String(255), nullable=False, index=True)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")

class Agent(Base):
    """Agent model for managing AI agents with visibility control"""
    __tablename__ = "agents"
    
    id = Column(String(50), primary_key=True)
    letta_uid = Column(String(50), unique=True, nullable=False, index=True)  # CRITICAL for Broca integration
    name = Column(String(100))  # e.g., "Athena", "Monday", "Timbre"
    description = Column(Text)
    status = Column(String(20), default="Healthy", index=True)  # 'Healthy', 'Degraded', 'Off', 'Ready'
    created_by = Column(Integer, ForeignKey("users.id"), index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    config = Column(JSON)  # Agent-specific configuration
    is_active = Column(Boolean, default=True, index=True)
    visible_to_users = Column(JSON)  # [1, 5, 12] specific user IDs, or NULL for all users
    visible_to_roles = Column(JSON)  # ['admin', 'user'] specific roles, or NULL for all roles
    
    # Relationships
    creator = relationship("User", back_populates="created_agents", foreign_keys=[created_by])

class SchemaVersion(Base):
    """Schema version tracking for migrations"""
    __tablename__ = "schema_version"
    
    version = Column(Integer, primary_key=True)
    applied_at = Column(DateTime, default=func.now())
    description = Column(Text)

# Database utility functions
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def get_current_schema_version():
    """Get current schema version"""
    db = SessionLocal()
    try:
        version = db.query(SchemaVersion).order_by(SchemaVersion.version.desc()).first()
        return version.version if version else 0
    finally:
        db.close()

# Agent visibility helper functions
def is_agent_visible_to_user(agent, user_id, user_role):
    """Check if agent is visible to a specific user"""
    if not agent.is_active:
        return False
    
    # Check user-specific visibility
    if agent.visible_to_users and user_id in agent.visible_to_users:
        return True
    
    # Check role-based visibility
    if agent.visible_to_roles and user_role in agent.visible_to_roles:
        return True
    
    # If no restrictions, visible to all
    if not agent.visible_to_users and not agent.visible_to_roles:
        return True
    
    return False

def get_agents_visible_to_user(user_id, user_role, db_session):
    """Get all agents visible to a specific user"""
    agents = db_session.query(Agent).filter(Agent.is_active == True).all()
    return [agent for agent in agents if is_agent_visible_to_user(agent, user_id, user_role)]
