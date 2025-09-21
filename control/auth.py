"""
Animus Control Interface - Authentication Module
Copyright (c) 2025 Mark Rizzn Hopkins

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
"""

"""
Authentication module for Animus UI
Handles user login, session management, and password hashing
"""

import bcrypt
import secrets
import string
from datetime import datetime, timedelta
from typing import Optional, Tuple
from flask import request, session
from functools import wraps
from models import User, UserSession, get_db

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_session_token() -> str:
    """Generate a secure random session token"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(64))

def create_user_session(user_id: int, ip_address: str = None, user_agent: str = None) -> UserSession:
    """Create a new user session"""
    if ip_address is None:
        ip_address = request.remote_addr if request else "unknown"
    if user_agent is None:
        user_agent = request.headers.get('User-Agent') if request else "unknown"
    
    # Session expires in 24 hours
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    session_obj = UserSession(
        id=generate_session_token(),  # Use session token as ID to match existing schema
        user_id=user_id,
        session_token=generate_session_token(),
        ip_address=ip_address,
        user_agent=user_agent,
        expires_at=expires_at
    )
    
    return session_obj

def authenticate_user(username: str, password: str) -> Tuple[bool, Optional[dict], str]:
    """
    Authenticate a user with username and password
    
    Returns:
        Tuple of (success, user_dict, error_message)
    """
    db = next(get_db())
    
    try:
        # Find user by username
        user = db.query(User).filter(User.username == username).first()
        
        if not user:
            return False, None, "Invalid username or password"
        
        if not user.is_active:
            return False, None, "Account is deactivated"
        
        # Verify password
        if not verify_password(password, user.password_hash):
            # Increment failed login attempts (handle None case)
            if user.failed_login_attempts is None:
                user.failed_login_attempts = 1
            else:
                user.failed_login_attempts += 1
            
            db.commit()
            return False, None, "Invalid username or password"
        
        # Reset failed login attempts on successful login
        user.failed_login_attempts = 0
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Return user data as dictionary to avoid detached instance issues
        user_dict = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active,
            'last_login': user.last_login,
            'created_at': user.created_at,
            'updated_at': user.updated_at
        }
        
        return True, user_dict, ""
        
    except Exception as e:
        db.rollback()
        return False, None, f"Authentication error: {str(e)}"
    finally:
        db.close()

def get_user_by_session_token(token: str) -> Optional[User]:
    """Get user by session token"""
    db = next(get_db())
    
    try:
        session_obj = db.query(UserSession).filter(
            UserSession.session_token == token,
            UserSession.expires_at > datetime.utcnow()
        ).first()
        
        if session_obj:
            return session_obj.user
        return None
        
    finally:
        db.close()

def cleanup_expired_sessions():
    """Remove expired sessions from database"""
    db = next(get_db())
    
    try:
        expired_sessions = db.query(UserSession).filter(
            UserSession.expires_at <= datetime.utcnow()
        ).all()
        
        for expired_session in expired_sessions:
            db.delete(expired_session)
        
        db.commit()
        return len(expired_sessions)
        
    except Exception as e:
        db.rollback()
        return 0
    finally:
        db.close()

def require_auth(f):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if user is logged in via Flask session
        if 'user_id' not in session:
            return {'error': 'Authentication required'}, 401
        
        # Verify session is still valid
        user = get_user_by_session_token(session.get('session_token'))
        if not user:
            # Clear invalid session
            session.clear()
            return {'error': 'Session expired'}, 401
        
        return f(*args, **kwargs)
    return decorated_function

def require_role(required_role: str):
    """Decorator to require specific role for routes"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if user is logged in
            if 'user_id' not in session:
                return {'error': 'Authentication required'}, 401
            
            # Verify session is still valid
            user = get_user_by_session_token(session.get('session_token'))
            if not user:
                session.clear()
                return {'error': 'Session expired'}, 401
            
            # Check role
            if user.role != required_role and user.role != 'admin':
                return {'error': 'Insufficient permissions'}, 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator
