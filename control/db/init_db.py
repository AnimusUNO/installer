#!/usr/bin/env python3
"""
Database initialization script for Sanctum UI
Creates the database and applies the schema from init_database.sql
"""

import sqlite3
import os
from pathlib import Path

def init_database():
    """Initialize the database with the schema"""
    
    # Get the directory where this script is located
    db_dir = Path(__file__).parent
    db_path = db_dir / "animus_ui.db"
    sql_script = db_dir / "init_database.sql"
    
    print(f"Initializing database at: {db_path}")
    print(f"Using SQL script: {sql_script}")
    
    # Check if SQL script exists
    if not sql_script.exists():
        print(f"ERROR: SQL script not found at {sql_script}")
        return False
    
    # Create database connection
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Connected to database successfully")
        
        # Read and execute the SQL script
        with open(sql_script, 'r') as f:
            sql_content = f.read()
        
        print("Executing SQL script...")
        cursor.executescript(sql_content)
        
        # Commit changes
        conn.commit()
        print("Database initialized successfully!")
        
        # Verify tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"Tables created: {[table[0] for table in tables]}")
        
        # Check schema version
        cursor.execute("SELECT version, applied_at FROM schema_version ORDER BY version DESC LIMIT 1")
        version = cursor.fetchone()
        if version:
            print(f"Schema version: {version[0]} - Applied at: {version[1]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"ERROR: Failed to initialize database: {e}")
        return False

if __name__ == "__main__":
    success = init_database()
    if success:
        print("\n✅ Database initialization completed successfully!")
        print("You can now start the control application.")
    else:
        print("\n❌ Database initialization failed!")
        exit(1)
