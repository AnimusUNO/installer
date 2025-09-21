#!/usr/bin/env python3
"""
Animus Control Interface - Database Initialization Script
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
Initialize the database with the new system_config table
"""

import os
import sys
from models import init_db, get_db, User, SystemConfig, SchemaVersion
import bcrypt

def init_database():
    """Initialize the database with all tables and default data"""
    print("🚀 Initializing Animus UI Database...")
    
    # Create tables
    print("📋 Creating database tables...")
    init_db()
    
    # Execute SQL file to create chat tables and rate limiting tables
    print("📋 Creating chat and rate limiting tables...")
    import sqlite3
    import os
    
    # Get the path to the SQL file
    sql_file_path = os.path.join(os.path.dirname(__file__), 'db', 'init_database.sql')
    
    if os.path.exists(sql_file_path):
        # Connect to the database
        db_path = os.path.join(os.path.dirname(__file__), 'db', 'animus_ui.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            # Read and execute the SQL file
            with open(sql_file_path, 'r') as f:
                sql_script = f.read()
            
            # Execute the script
            cursor.executescript(sql_script)
            conn.commit()
            print("✅ Chat and rate limiting tables created successfully")
        except Exception as e:
            print(f"⚠️  Warning: Error executing SQL file: {e}")
            print("   Tables will be created by the working Flask system when needed")
        finally:
            conn.close()
    else:
        print("⚠️  Warning: SQL file not found at db/init_database.sql")
        print("   Tables will be created by the working Flask system when needed")
    
    print("✅ All tables created successfully")
    
    # Get database session
    db = next(get_db())
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.username == 'admin').first()
        if not admin_user:
            print("👤 Creating default admin user...")
            # Hash password for admin123
            password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            admin_user = User(
                username='admin',
                email='admin@animus.local',
                password_hash=password_hash,
                role='admin',
                permissions='["*"]',
                is_active=True,
                failed_login_attempts=0
            )
            db.add(admin_user)
            print("✅ Admin user created")
        else:
            print("ℹ️  Admin user already exists")
        
        # Check if system config already exists
        system_configs = db.query(SystemConfig).all()
        if not system_configs:
            print("⚙️  Creating default system configuration...")
            default_configs = [
                SystemConfig(config_key='api_key', config_value='ObeyG1ant', description='API key for external integrations'),
                SystemConfig(config_key='admin_key', config_value='FreeUkra1ne', description='Admin authentication key'),
                SystemConfig(config_key='flask_port', config_value='5000', description='Flask application port'),
                SystemConfig(config_key='smcp_port', config_value='9000', description='SMCP service port'),
                SystemConfig(config_key='openai_api_key', config_value='', description='OpenAI API key for AI integrations'),
                SystemConfig(config_key='anthropic_api_key', config_value='', description='Anthropic API key for AI integrations'),
                SystemConfig(config_key='ollama_base_url', config_value='http://localhost:11434', description='Ollama base URL'),
                SystemConfig(config_key='animus_base_path', config_value='~/animus', description='Animus base installation path'),
                SystemConfig(config_key='letta_data_path', config_value='~/.letta', description='Letta data directory path'),
                SystemConfig(config_key='letta_server_address', config_value='https://localhost', description='Letta server address'),
                SystemConfig(config_key='letta_server_port', config_value='443', description='Letta server port'),
                SystemConfig(config_key='letta_server_token', config_value='', description='Letta server authentication token'),
                SystemConfig(config_key='letta_connection_timeout', config_value='30', description='Letta connection timeout in seconds'),
                SystemConfig(config_key='letta_server_active', config_value='true', description='Letta server connection status'),
                SystemConfig(config_key='session_timeout', config_value='1800', description='Chat session timeout in seconds'),
                SystemConfig(config_key='max_message_length', config_value='10000', description='Maximum message length')
            ]
            for config in default_configs:
                db.add(config)
            print("✅ System configuration created")
        else:
            print("ℹ️  System configuration already exists")
        
        # Check if schema version exists
        schema_version = db.query(SchemaVersion).first()
        if not schema_version:
            print("📊 Setting schema version...")
            schema_version = SchemaVersion(version=1, description='Initial MVP schema: users, user_sessions, agents, system_config')
            db.add(schema_version)
            print("✅ Schema version set")
        else:
            print("ℹ️  Schema version already exists")
        
        # Commit all changes
        db.commit()
        print("💾 Database initialization completed successfully!")
        
        # Display summary
        print("\n📋 Database Summary:")
        print(f"   Users: {db.query(User).count()}")
        print(f"   System Config Entries: {db.query(SystemConfig).count()}")
        print(f"   Schema Version: {db.query(SchemaVersion).count()}")
        
        if admin_user:
            print(f"\n🔑 Admin Login:")
            print(f"   Username: admin")
            print(f"   Password: admin123")
        
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
