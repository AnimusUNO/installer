#!/usr/bin/env python3
"""
Animus Control Interface - System Config Test Script
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
Test script to verify system_config table functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import get_db, SystemConfig
import json

def test_system_config():
    """Test the system configuration table"""
    print("Testing System Configuration...")
    
    db = next(get_db())
    try:
        # Test getting configuration
        config = SystemConfig.get_config(db)
        print(f"✅ Config loaded: ID {config.id}")
        
        # Test updating configuration
        test_updates = {
            'openai_api_key': 'test_key_123',
            'letta_server_address': '192.168.1.100'
        }
        
        config.update_config(**test_updates)
        db.commit()
        print("✅ Configuration updated successfully")
        
        # Verify updates
        db.refresh(config)
        print(f"✅ OpenAI Key: {config.openai_api_key}")
        print(f"✅ Letta Server: {config.letta_server_address}")
        
        # Test JSON serialization
        config_dict = {
            'id': config.id,
            'openai_api_key': config.openai_api_key,
            'anthropic_api_key': config.anthropic_api_key,
            'ollama_base_url': config.ollama_base_url,
            'animus_base_path': config.animus_base_path,
            'letta_data_path': config.letta_data_path,
            'flask_port': config.flask_port,
            'smcp_port': config.smcp_port,
            'letta_server_address': config.letta_server_address,
            'letta_server_port': config.letta_server_port,
            'letta_server_token': config.letta_server_token,
            'letta_server_active': config.letta_server_active,
            'created_at': config.created_at.isoformat() if config.created_at else None,
            'updated_at': config.updated_at.isoformat() if config.updated_at else None
        }
        
        print("\n📋 Full Configuration:")
        print(json.dumps(config_dict, indent=2))
        
        print("\n✅ All tests passed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_system_config()
