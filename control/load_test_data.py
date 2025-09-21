#!/usr/bin/env python3
import sqlite3

def simple_load():
    db_path = 'db/animus_ui.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Loading test data...")
        
        # Clear existing test data
        cursor.execute("DELETE FROM agents WHERE name = 'Iris'")
        
        # Insert Iris test agent with all fields
        cursor.execute("""
            INSERT INTO agents (
                letta_uid,
                name,
                description,
                status,
                created_by,
                config,
                is_active,
                visible_to_users,
                visible_to_roles
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'iris_letta_001',
            'Iris',
            'Iris is the flagship Sanctum agent—an adaptive operator–oracle that orchestrates tools, deepens user context, and speaks with clarity and care. She\'s the opposite of Siri. Get it?',
            'Healthy',
            1,
            '{"version": "0.8.3"}',
            1,
            '',
            ''
        ))
        
        conn.commit()
        print("✅ Test data loaded successfully!")
        
        # Show what we inserted
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
    simple_load()
