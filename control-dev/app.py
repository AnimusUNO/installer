#!/usr/bin/env python3
from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for, flash
import os
import json
from datetime import datetime
from models import User, UserSession, Agent, get_db, get_agents_visible_to_user
from auth import authenticate_user, create_user_session, get_user_by_session_token, require_auth, require_role, cleanup_expired_sessions

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change in production
app.config['STATIC_FOLDER'] = 'static'

# Ensure static folder exists
os.makedirs('static', exist_ok=True)

# Initialize database
from models import init_db
init_db()

@app.route('/')
def index():
    """Main chat interface"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login page"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        success, user_dict, error = authenticate_user(username, password)
        
        if success:
            # Get user data from dictionary
            user_id = user_dict['id']
            username = user_dict['username']
            user_role = user_dict['role']
            
            # Create session
            user_session = create_user_session(user_id)
            db = next(get_db())
            try:
                db.add(user_session)
                db.commit()
                
                # Set Flask session
                session['user_id'] = user_id
                session['username'] = username
                session['role'] = user_role
                session['session_token'] = user_session.session_token
                
                return redirect(url_for('index'))
            except Exception as e:
                db.rollback()
                flash(f"Login error: {str(e)}", 'error')
            finally:
                db.close()
        else:
            flash(error, 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """User logout"""
    # Clear Flask session
    session.clear()
    return redirect(url_for('login'))

@app.route('/settings')
@require_auth
def settings():
    """Settings and tools management interface"""
    # Debug logging
    print(f"DEBUG: Session user_id: {session.get('user_id')}")
    print(f"DEBUG: Session role: {session.get('role')}")
    
    # Get user's visible agents from database
    db = next(get_db())
    try:
        agents = get_agents_visible_to_user(session['user_id'], session['role'], db)
        print(f"DEBUG: Found {len(agents)} agents: {[agent.name for agent in agents]}")
        
        return render_template('settings.html', 
                             page_title='Settings',
                             back_url='/',
                             back_text='Back to Chat',
                             agents=agents)
    except Exception as e:
        print(f"DEBUG: Error getting agents: {e}")
        # If there's an error getting agents, just pass empty list
        return render_template('settings.html', 
                             page_title='Settings',
                             back_url='/',
                             back_text='Back to Chat',
                             agents=[])
    finally:
        db.close()

@app.route('/system-settings')
@require_auth
@require_role('admin')
def system_settings():
    """System settings and user management interface"""
    return render_template('system_settings.html')

@app.route('/install-tool')
@require_auth
@require_role('admin')
def install_tool():
    """Install tool interface"""
    return render_template('install_tool.html')

@app.route('/cron-scheduler')
@require_auth
@require_role('admin')
def cron_scheduler():
    """CRON scheduler interface"""
    return render_template('cron_scheduler.html')

@app.route('/chat-settings')
@require_auth
def chat_settings():
    """Chat settings configuration interface"""
    return render_template('chat_settings.html')

@app.route('/broca-settings')
@require_auth
@require_role('admin')
def broca_settings():
    """Broca Settings interface"""
    return render_template('broca_settings.html')

@app.route('/backup-restore')
@require_auth
@require_role('admin')
def backup_restore():
    """Backup & Restore interface"""
    return render_template('backup_restore.html')

@app.route('/create-agent')
@require_auth
@require_role('admin')
def create_agent():
    """Create Agent interface"""
    return render_template('create_agent.html')

@app.route('/logs-status')
@require_auth
def logs_status():
    """Logs & Status interface"""
    return render_template('logs_status.html')

@app.route('/smcp-plugins')
@require_auth
@require_role('admin')
def smcp_plugins():
    """SMCP Plugins management interface"""
    return render_template('smcp_plugins.html')

@app.route('/smcp-tools')
@require_auth
@require_role('admin')
def smcp_tools():
    """SMCP Tools management interface"""
    return render_template('smcp_tools.html')

@app.route('/smcp-sessions')
@require_auth
@require_role('admin')
def smcp_sessions():
    """SMCP Sessions management interface"""
    return render_template('smcp_sessions.html')

@app.route('/smcp-health')
@require_auth
def smcp_health():
    """SMCP Health monitoring interface"""
    return render_template('smcp_health.html')

@app.route('/api/chat', methods=['POST'])
@require_auth
def chat():
    """Handle chat messages"""
    data = request.get_json()
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    # TODO: Integrate with actual Animus backend
    # For now, return a simple response
    response = {
        'message': f"I received your message: \"{message}\". Processing...",
        'timestamp': datetime.now().isoformat(),
        'agent': 'athena'
    }
    
    return jsonify(response)

@app.route('/api/agents')
@require_auth
def get_agents():
    """Get available agents for the current user"""
    db = next(get_db())
    try:
        user_id = session.get('user_id')
        user_role = session.get('role')
        
        # Get agents visible to the current user
        agents = get_agents_visible_to_user(user_id, user_role, db)
        
        # Convert to JSON-serializable format
        agent_list = []
        for agent in agents:
            agent_list.append({
                'id': agent.id,
                'name': agent.name,
                'description': agent.description,
                'status': agent.status,
                'letta_uid': agent.letta_uid
            })
        
        return jsonify(agent_list)
    finally:
        db.close()

@app.route('/api/tools')
@require_auth
def get_tools():
    """Get available tools"""
    # TODO: Replace with database-driven tools table
    tools = [
        {
            'id': 'system-settings',
            'name': 'System Settings',
            'description': 'Base ports, paths, environment variables',
            'emoji': '⚙️',
            'status': 'Healthy',
            'category': 'master'
        },
        {
            'id': 'network-config',
            'name': 'Network Configuration',
            'description': 'Firewall, routing, and connectivity settings',
            'emoji': '🌐',
            'status': 'Healthy',
            'category': 'master'
        },
        {
            'id': 'security-settings',
            'name': 'Security Settings',
            'description': 'Authentication, encryption, and access control',
            'emoji': '🔒',
            'status': 'Healthy',
            'category': 'master'
        }
    ]
    return jsonify(tools)

@app.route('/api/status')
@require_auth
def get_status():
    """Get system status"""
    status = {
        'status': 'Healthy',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'nginx': 'running',
            'letta': 'running',
            'flask': 'running'
        }
    }
    return jsonify(status)

@app.route('/api/users')
@require_auth
@require_role('admin')
def get_users():
    """Get all users (admin only)"""
    db = next(get_db())
    try:
        users = db.query(User).all()
        user_list = []
        for user in users:
            user_list.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'is_active': user.is_active,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'created_at': user.created_at.isoformat() if user.created_at else None
            })
        return jsonify(user_list)
    finally:
        db.close()

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@require_auth
@require_role('admin')
def update_user(user_id):
    """Update user (admin only)"""
    db = next(get_db())
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if 'role' in data:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'email' in data:
            user.email = data['email']
        
        db.commit()
        return jsonify({'message': 'User updated successfully'})
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/agents/<agent_id>', methods=['PUT'])
@require_auth
@require_role('admin')
def update_agent(agent_id):
    """Update agent (admin only)"""
    db = next(get_db())
    try:
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            return jsonify({'error': 'Agent not found'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            agent.name = data['name']
        if 'description' in data:
            agent.description = data['description']
        if 'status' in data:
            agent.status = data['status']
        if 'is_active' in data:
            agent.is_active = data['is_active']
        if 'visible_to_users' in data:
            agent.visible_to_users = data['visible_to_users']
        if 'visible_to_roles' in data:
            agent.visible_to_roles = data['visible_to_roles']
        
        db.commit()
        return jsonify({'message': 'Agent updated successfully'})
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/cleanup-sessions', methods=['POST'])
@require_auth
@require_role('admin')
def cleanup_sessions():
    """Clean up expired sessions (admin only)"""
    try:
        count = cleanup_expired_sessions()
        return jsonify({'message': f'Cleaned up {count} expired sessions'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
