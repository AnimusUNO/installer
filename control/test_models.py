#!/usr/bin/env python3
"""
Test script for database models
"""

from models import User, Agent, get_db, init_db
from auth import hash_password, create_user_session
from datetime import datetime

def test_database():
    """Test basic database operations"""
    
    print("Testing database models...")
    
    # Initialize database (this will create tables if they don't exist)
    init_db()
    
    # Get database session
    db = next(get_db())
    
    try:
        # Test user creation
        print("\n1. Testing user creation...")
        
        # Check if admin user exists
        admin_user = db.query(User).filter(User.username == 'admin').first()
        
        if admin_user:
            print(f"   Admin user exists: {admin_user.username} ({admin_user.role})")
            
            # Update admin password if it's still the default
            if admin_user.password_hash == 'CHANGE_ME_ON_FIRST_LOGIN':
                admin_user.password_hash = hash_password('admin123')
                db.commit()
                print("   Updated admin password to 'admin123'")
        else:
            print("   Creating admin user...")
            admin_user = User(
                username='admin',
                email='admin@animus.local',
                password_hash=hash_password('admin123'),
                role='admin',
                permissions=['*'],
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("   Admin user created with password 'admin123'")
        
        # Test agent creation
        print("\n2. Testing agent creation...")
        
        agents = db.query(Agent).all()
        print(f"   Found {len(agents)} agents:")
        
        for agent in agents:
            print(f"     - {agent.name} ({agent.id}): {agent.status}")
            print(f"       Letta UID: {agent.letta_uid}")
            print(f"       Visible to roles: {agent.visible_to_roles}")
        
        # Test user session creation
        print("\n3. Testing session creation...")
        
        session_obj = create_user_session(admin_user.id)
        db.add(session_obj)
        db.commit()
        
        print(f"   Created session: {session_obj.id[:20]}...")
        print(f"   Expires: {session_obj.expires_at}")
        
        # Test agent visibility
        print("\n4. Testing agent visibility...")
        
        from models import get_agents_visible_to_user
        
        visible_agents = get_agents_visible_to_user(admin_user.id, admin_user.role, db)
        print(f"   Agents visible to admin: {len(visible_agents)}")
        
        for agent in visible_agents:
            print(f"     - {agent.name}: {agent.status}")
        
        print("\n✅ All tests passed!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    test_database()
