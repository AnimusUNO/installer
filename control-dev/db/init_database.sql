-- Sanctum UI Database Initialization Script
-- This script creates all necessary tables for the UI management system
-- Run this script to initialize a fresh database

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- =============================================================================
-- Phase 1: User Management & Authentication
-- =============================================================================

-- Users Table (Core) - Full Production Schema
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'admin', 'user', 'viewer'
    permissions JSON, -- User-specific permissions
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP
);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================================================
-- Phase 3: Agents Table (Future Enhancements with Visibility Control)
-- =============================================================================

-- Agents table for future enhancements with visibility control
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(50) PRIMARY KEY,
    letta_uid VARCHAR(50) UNIQUE NOT NULL, -- CRITICAL for Broca integration
    name VARCHAR(100), -- e.g., "Athena", "Monday", "Timbre"
    description TEXT,
    status VARCHAR(20) DEFAULT 'Healthy', -- 'Healthy', 'Degraded', 'Off', 'Ready'
    created_by INTEGER, -- Foreign key to users.id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    config JSON, -- Agent-specific configuration
    is_active BOOLEAN DEFAULT true,
    visible_to_users JSON, -- [1, 5, 12] specific user IDs, or NULL for all users
    visible_to_roles JSON -- ['admin', 'user'] specific roles, or NULL for all roles
);

-- =============================================================================
-- Performance Indexes
-- =============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Agents table indexes
CREATE INDEX IF NOT EXISTS idx_agents_letta_uid ON agents(letta_uid);
CREATE INDEX IF NOT EXISTS idx_agents_created_by ON agents(created_by);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- =============================================================================
-- Sample Data Population
-- =============================================================================

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (id, username, email, password_hash, role, permissions, is_active, failed_login_attempts) VALUES
(1, 'admin', 'admin@animus.local', '$2b$12$H2UoYl0FVEaq8moKx31a8OUu.RExWusGUAVk17bqgUBUI2krD771q', 'admin', '["*"]', true, 0);

-- Note: Test agents are loaded via test.sql for development

-- =============================================================================
-- Schema Version Tracking
-- =============================================================================

-- Create schema version table for future migrations
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Insert current schema version
INSERT OR IGNORE INTO schema_version (version, description) VALUES
(1, 'Initial MVP schema: users, user_sessions, agents');

-- =============================================================================
-- Notes
-- =============================================================================
-- 
-- This database is designed for forward compatibility:
-- - All tables use full production schema from the start
-- - No ALTER TABLE statements needed for future features
-- - JSON fields allow extensibility without schema changes
-- - Foreign key constraints ensure data integrity
-- - Proper indexing for performance
--
-- To reset database during development:
-- rm control/db/animus_ui.db
-- sqlite3 control/db/animus_ui.db < control/db/init_database.sql
