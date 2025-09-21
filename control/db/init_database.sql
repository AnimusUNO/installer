-- Animus UI Database Initialization Script
-- This script creates all necessary tables for the UI management system
-- Run this script to initialize a fresh database
--
-- Copyright (c) 2025 Mark Rizzn Hopkins
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU Affero General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU Affero General Public License for more details.
--
-- You should have received a copy of the GNU Affero General Public License
-- along with this program.  If not, see <https://www.gnu.org/licenses/>.

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Note: Main application tables (users, agents, system_config, schema_version) 
-- are created by SQLAlchemy models in init_database.py
-- This file only creates chat-specific tables

-- Chat session management (working Flask system expects this exact schema)
CREATE TABLE IF NOT EXISTS web_chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    uid TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    metadata TEXT DEFAULT '{}'
);

-- User messages (working Flask system expects this exact schema)
CREATE TABLE IF NOT EXISTS web_chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'user',
    processed INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT DEFAULT '{}',
    FOREIGN KEY (session_id) REFERENCES web_chat_sessions (session_id)
);

-- System responses (working Flask system expects this exact schema)
CREATE TABLE IF NOT EXISTS web_chat_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    response_id TEXT UNIQUE,
    response TEXT NOT NULL,
    message_id INTEGER,
    status TEXT DEFAULT 'sent',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT DEFAULT '{}',
    FOREIGN KEY (session_id) REFERENCES web_chat_sessions (session_id)
);

-- Rate limiting data (working Flask system expects this exact schema)
CREATE TABLE IF NOT EXISTS rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ip_address, endpoint, window_start)
);

-- Note: Indexes for main application tables are created by SQLAlchemy
-- This file only creates chat-specific tables and their indexes

-- Note: system_config indexes are not needed for basic functionality

-- Note: Default data (admin user, system config, schema version) 
-- is inserted by init_database.py via SQLAlchemy models
