#!/usr/bin/env python3
"""
Sanctum Control Interface - Main Flask Application
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

from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for, flash
import os
import json
import bcrypt
from datetime import datetime
from models import User, UserSession, Agent, SystemConfig, get_db, get_agents_visible_to_user
from sqlalchemy import or_
from auth import authenticate_user, create_user_session, get_user_by_session_token, require_auth, require_role, cleanup_expired_sessions

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change in production
app.config['STATIC_FOLDER'] = 'static'
app.config['DATABASE_PATH'] = 'db/animus_ui.db'  # Path to integrated database

# Default API keys for working Flask system
app.config['DEFAULT_API_KEY'] = 'ObeyG1ant'
app.config['DEFAULT_ADMIN_KEY'] = 'FreeUkra1ne'

# Ensure static folder exists
os.makedirs('static', exist_ok=True)

# Initialize database
from models import init_db
init_db()

# Register working Flask system blueprints
from api import bp as api_bp
from chat import bp as chat_bp

app.register_blueprint(api_bp, url_prefix='/api/v1')
app.register_blueprint(chat_bp, url_prefix='/chat')

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
    """System settings and configuration interface"""
    db = next(get_db())
    try:
        # Get system configuration
        config = SystemConfig.get_config(db)
        return render_template('system_settings.html', config=config)
    finally:
        db.close()

@app.route('/user-management')
@require_auth
@require_role('admin')
def user_management():
    """User management and discovery interface"""
    return render_template('user_management.html')

# User Management API Endpoints
@app.route('/api/users', methods=['GET'])
@require_auth
@require_role('admin')
def get_users():
    """Get all users with optional filtering"""
    db = next(get_db())
    try:
        search_term = request.args.get('search', '').lower()
        role_filter = request.args.get('role', '')
        
        # Build query
        query = db.query(User).filter(User.is_active == True)
        
        if search_term:
            query = query.filter(
                or_(
                    User.username.ilike(f'%{search_term}%'),
                    User.email.ilike(f'%{search_term}%')
                )
            )
        
        if role_filter:
            query = query.filter(User.role == role_filter)
        
        users = query.all()
        
        # Convert to JSON-serializable format
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

@app.route('/api/users', methods=['POST'])
@require_auth
@require_role('admin')
def create_user():
    """Create a new user"""
    db = next(get_db())
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['username', 'email', 'role']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if user already exists
        existing_user = db.query(User).filter(
            or_(User.username == data['username'], User.email == data['email'])
        ).first()
        
        if existing_user:
            return jsonify({'error': 'Username or email already exists'}), 409
        
        # Create new user
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=bcrypt.hashpw('changeme123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            role=data['role'],
            permissions=data.get('permissions', '[]'),
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        
        return jsonify({
            'id': new_user.id,
            'username': new_user.username,
            'email': new_user.email,
            'role': new_user.role,
            'message': 'User created successfully'
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@require_auth
@require_role('admin')
def update_user(user_id):
    """Update an existing user"""
    db = next(get_db())
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        if 'role' in data:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'permissions' in data:
            user.permissions = data['permissions']
        
        # Update password if provided
        if 'password' in data and data['password']:
            user.password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        user.updated_at = datetime.now()
        db.commit()
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active,
            'message': 'User updated successfully'
        })
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@require_auth
@require_role('admin')
def delete_user(user_id):
    """Delete a user (soft delete by setting inactive)"""
    db = next(get_db())
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Soft delete - set inactive instead of actually deleting
        user.is_active = False
        user.updated_at = datetime.now()
        db.commit()
        
        return jsonify({'message': 'User deactivated successfully'})
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/users/discover', methods=['POST'])
@require_auth
@require_role('admin')
def discover_users():
    """Discover users from Broca database"""
    # TODO: Implement actual Broca integration
    # For now, return mock data
    mock_discovered_users = [
        {
            'username': 'broca_user_1',
            'email': 'user1@broca.local',
            'last_interaction': '2024-01-15T10:30:00Z',
            'interaction_count': 5
        },
        {
            'username': 'broca_user_2', 
            'email': 'user2@broca.local',
            'last_interaction': '2024-01-14T15:45:00Z',
            'interaction_count': 12
        }
    ]
    
    return jsonify(mock_discovered_users)

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
    
    # TODO: Integrate with actual Sanctum backend
    # For now, return a simple response
    response = {
        'message': f"I received your message: \"{message}\". Processing...",
        'timestamp': datetime.now().isoformat(),
        'agent': 'athena'
    }
    
    return jsonify(response)

@app.route('/api/system-config', methods=['GET', 'PUT'])
@require_auth
@require_role('admin')
def system_config():
    """Get or update system configuration"""
    db = next(get_db())
    try:
        if request.method == 'GET':
            # Get current configuration
            config = SystemConfig.get_config(db)
            return jsonify(config)
        else:
            # Update configuration
            data = request.get_json()
            
            # Update each configuration key
            for key, value in data.items():
                SystemConfig.set_config_value(db, key, str(value))
            
            return jsonify({'message': 'System configuration updated successfully'})
            
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/test-letta-connection', methods=['POST'])
@require_auth
@require_role('admin')
def test_letta_connection():
    """Test connection to Letta server"""
    print(f"DEBUG: test_letta_connection called with data: {request.get_json()}")  # Debug logging
    try:
        data = request.get_json()
        server_address = data.get('server_address')
        server_port = data.get('server_port')
        server_token = data.get('server_token')
        
        if not server_address or not server_port:
            return jsonify({'error': 'Server address and port are required'}), 400
        
        # Build the health endpoint URL
        base_url = server_address
        if not server_address.startswith('http://') and not server_address.startswith('https://'):
            base_url = f'https://{server_address}'
        
        # Add port if not already in URL
        if ':' not in base_url:
            health_url = f'{base_url}:{server_port}/v1/health/'
        else:
            health_url = f'{base_url}/v1/health/'
        
        # Prepare headers
        headers = {'Content-Type': 'application/json'}
        if server_token:
            headers['Authorization'] = f'Bearer {server_token}'
        
        # Test the connection using requests
        import requests
        from datetime import datetime
        
        start_time = datetime.now()
        try:
            response = requests.get(health_url, headers=headers, timeout=30)
            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds() * 1000  # Convert to milliseconds
            
            if response.ok:
                # Parse response
                try:
                    health_data = response.json()
                    status = health_data.get('status', 'unknown')
                    version = health_data.get('version', 'unknown')
                    
                    # Update last connected time in database
                    db = next(get_db())
                    try:
                        SystemConfig.set_config_value(db, 'last_connected', datetime.now().isoformat(), 'Last successful connection timestamp')
                    except Exception as e:
                        print(f"Error updating last_connected: {e}")
                    finally:
                        db.close()
                    
                    return jsonify({
                        'success': True,
                        'http_status': response.status_code,
                        'response_time': round(response_time),
                        'status': status,
                        'version': version,
                        'message': f'Connection successful! Letta server {version} is responding with status: {status}'
                    })
                except ValueError:
                    # Response is not JSON
                    return jsonify({
                        'success': True,
                        'http_status': response.status_code,
                        'response_time': round(response_time),
                        'message': f'Connection successful! Letta server responded with HTTP {response.status_code}'
                    })
            else:
                return jsonify({
                    'success': False,
                    'http_status': response.status_code,
                    'response_time': round(response_time),
                    'message': f'Server responded with error: HTTP {response.status_code}'
                })
                
        except requests.exceptions.Timeout:
            return jsonify({
                'success': False,
                'message': 'Connection timed out after 30 seconds'
            })
        except requests.exceptions.ConnectionError:
            return jsonify({
                'success': False,
                'message': 'Connection failed - server unreachable'
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Connection error: {str(e)}'
            })
            
    except Exception as e:
        print(f"DEBUG: Exception in test_letta_connection: {e}")  # Debug logging
        return jsonify({'error': str(e)}), 500

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
