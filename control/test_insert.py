#!/usr/bin/env python3
import sqlite3

def test_insert():
    conn = sqlite3.connect('db/animus_ui.db')
    cursor = conn.cursor()
    
    try:
        # Clean up test data
        cursor.execute("DELETE FROM agents WHERE letta_uid LIKE 'test_%'")
        
        # Test simple insert
        cursor.execute("""
            INSERT INTO agents (
                letta_uid, name, description, status, created_by, config, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            'iris_letta_001',
            'Iris',
            'Iris is the flagship Sanctum agent',
            'Healthy',
            1,
            '{"version": "0.8.3"}',
            1
        ))
        
        conn.commit()
        print("✅ Simple insert successful")
        
        # Test with NULL columns
        cursor.execute("""
            INSERT INTO agents (
                letta_uid, name, description, status, created_by, config, is_active, visible_to_users, visible_to_roles
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'iris_letta_002',
            'Iris 2',
            'Iris is the flagship Sanctum agent',
            'Healthy',
            1,
            '{"version": "0.8.3"}',
            1,
            None,
            None
        ))
        
        conn.commit()
        print("✅ Insert with NULLs successful")
        
        # Show what we inserted
        cursor.execute("SELECT name, status, letta_uid FROM agents WHERE name LIKE 'Iris%'")
        for row in cursor.fetchall():
            print(f"  {row[0]} ({row[1]}) - {row[2]}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    test_insert()
