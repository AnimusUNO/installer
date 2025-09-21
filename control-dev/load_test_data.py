#!/usr/bin/env python3
"""
Load test data for development
ONLY loads Iris agent - no other test agents
"""

import sqlite3
import os

def load_test_data():
    db_path = os.path.join(os.path.dirname(__file__), 'db', 'animus_ui.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        print("Please run init_db.py first to create the database")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Loading test data...")
        
        # Clear existing test data
        cursor.execute("DELETE FROM agents WHERE name = 'Iris'")
        
        # Insert Iris test agent based on Iris.af data
        cursor.execute("""
            INSERT INTO agents (
                id,
                letta_uid,
                name,
                description,
                status,
                created_by,
                config,
                is_active,
                visible_to_users,
                visible_to_roles
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'iris',
            'iris_letta_001',
            'Iris',
            'Iris is the flagship Sanctum agent—an adaptive operator–oracle that orchestrates tools, deepens user context, and speaks with clarity and care. She\'s the opposite of Siri. Get it?',
            'Healthy',
            1,  # created_by admin
            '{"version": "0.8.3", "embedding_model": "letta-free", "context_window": 8192, "temperature": 0.7, "max_tokens": 4096, "persona_version": "v1", "core_memory_blocks": ["SEP", "persona", "human"], "tool_count": 6, "is_default": true, "test_data": true}',
            True,  # is_active
            None,  # visible_to_users - visible to all users for testing
            None   # visible_to_roles - visible to all roles for testing
        ))
        
        # Update schema version
        cursor.execute("""
            INSERT OR REPLACE INTO schema_version (
                version,
                applied_at,
                description
            ) VALUES (?, ?, ?)
        """, (
            1,
            'CURRENT_TIMESTAMP',
            'Added test data for Iris agent only'
        ))
        
        conn.commit()
        
        print("✅ Test data loaded successfully!")
        print("\nTest Agents:")
        cursor.execute("SELECT name, status FROM agents WHERE name = 'Iris'")
        for row in cursor.fetchall():
            print(f"  {row[0]} ({row[1]})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading test data: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    load_test_data()
