# Flask Chat Bridge Architecture - Animus Integration

[![License: AGPLv3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0) [![Docs License: CC BY-SA 4.0](https://img.shields.io/badge/Docs%20License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![MCP Protocol](https://img.shields.io/badge/MCP-Protocol%20Compliant-green.svg)](https://modelcontextprotocol.io/)
[![Animus Core Module](https://img.shields.io/badge/Animus-Core%20Module-blue.svg)](https://animus.uno)

## Overview

This document outlines the recommended approach for implementing a Flask-based chat bridge to replace the PHP web chat plugin architecture. The Flask bridge will provide a lightweight, Python-native solution that integrates seamlessly with the existing Animus control system while maintaining clean separation between the chat interface and control interface.

---

## Architecture Overview

### **Simplified Bridge Pattern**

```
┌─────────────────┐    WebSocket/HTTP    ┌─────────────────┐
│   Animus UI    │ ◄──────────────────► │   Flask Chat    │
│   (Control)     │                      │   Bridge        │
│                 │                      │   (API for      │
└─────────────────┘                      │   Broca)        │
         │                               └─────────────────┘
         │                                       ▲
         │                                       │ HTTP
         ▼                                       │
┌─────────────────┐                      ┌─────────────────┐
│   Animus       │                      │   Broca Core    │
│   Registry DB   │                      │   (Queue/Agent) │
│   (Sessions)    │                      └─────────────────┘
└─────────────────┘
```

**Flow**:
- **Chat UI** directly reads/writes to Animus Registry DB
- **Flask Chat Bridge** provides API endpoints for Broca to communicate with
- **Broca** sends messages via API to update chat state
- **WebSocket** provides real-time updates between UI and bridge

**Key Point**: The chat UI directly integrates with the database locally. The API is the bridge between Broca and the UI, not between the UI and the database.

### **Key Design Principles**

1. **Python Ecosystem Alignment**: Flask integrates naturally with existing Animus Python infrastructure
2. **Minimal Complexity**: Keep only essential features, eliminate enterprise-level over-engineering
3. **Session Persistence**: Use existing Animus registry database for session management
4. **Real-time Communication**: WebSocket for instant updates, no polling delays
5. **Clean Separation**: Chat system independent of control interface for maintainability
6. **Database Isolation**: Maintain separation from Broca databases for security

---

## Implementation Structure

### **Directory Structure**

```
/animus/control/
├── app.py                   # Main control system Flask app
├── static/                  # Static files (CSS, JS, images)
├── templates/               # HTML templates
│   ├── chat.html           # Chat interface template (NEW)
│   ├── index.html          # Main dashboard
│   ├── chat_settings.html  # Chat configuration
│   └── ...                 # Other existing templates
└── chat_bridge/            # Chat bridge Flask app
    ├── app.py              # Chat bridge Flask app
    └── requirements.txt    # Chat bridge dependencies
```

**Note**: The chat bridge integrates with the existing control system, not as a separate entity.

### **Integration Points**

#### **Animus Control System**
- **Process Management**: Run chat bridge alongside main control app
- **Configuration**: Use same `.env` patterns as other modules
- **Logging**: Integrate with existing log aggregation system
- **Health Monitoring**: Add to existing status pages
- **Shared Infrastructure**: Leverage existing control system Flask app and static files
- **Database Access**: Use existing `/animus/control/animus_ui.db` for chat sessions
- **Templates**: Add chat.html to existing `/animus/control/templates/` directory

#### **Broca Integration**
- **Direct Communication**: Use Broca's existing queue and agent systems
- **Database Access**: Leverage Broca's conversation storage
- **User Management**: Integrate with existing Broca user system
- **Database Isolation**: Chat sessions stored in Animus registry, separate from Broca databases

---

## Core Components

### **1. Broca2 Plugin (`broca2_web_chat.py`)**

**Location**: This goes in your Broca2 plugins directory (typically `/path/to/broca2/plugins/` or wherever your Broca2 system stores plugins)

```python
# broca2_web_chat.py
import asyncio
import aiohttp
from broca2.plugins import Plugin

class WebChatPlugin(Plugin):
    def __init__(self):
        super().__init__()
        self.chat_api_url = "http://localhost:8001/api/chat"
    
    async def handle_web_chat_message(self, user_id, agent_id, message):
        """Handle incoming web chat messages"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.chat_api_url,
                    json={
                        'user_id': user_id,
                        'agent_id': agent_id,
                        'message': message
                    }
                ) as response:
                    result = await response.json()
                    return result.get('response', 'No response')
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def process_message(self, message):
        """Process incoming messages from web chat"""
        # Your Broca2 message processing logic here
        # This integrates with your existing agent system
        pass
```

### **2. Flask Chat App (`app.py`)**

```python
from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_sqlalchemy import SQLAlchemy
import os
import uuid
from datetime import datetime
import requests

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../registry.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Models
class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'
    id = db.Column(db.String(32), primary_key=True)
    user_id = db.Column(db.String(32), nullable=False)
    agent_id = db.Column(db.String(32), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(32), db.ForeignKey('chat_sessions.id'))
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Routes
@app.route('/')
def chat_interface():
    """Main chat interface"""
    return render_template('chat.html')

@app.route('/api/chat/send', methods=['POST'])
def send_message():
    """API endpoint for Broca2 to send messages"""
    data = request.get_json()
    session_id = data.get('session_id')
    message = data.get('message')
    agent_id = data.get('agent_id')
    
    # Store message
    msg = ChatMessage(session_id=session_id, message=message, response="")
    db.session.add(msg)
    db.session.commit()
    
    # Real-time update
    socketio.emit('message_response', {
        'session_id': session_id,
        'response': "Message received by Broca2"
    })
    
    return jsonify({'status': 'sent'})

@app.route('/api/sessions/create', methods=['POST'])
def create_session():
    """Create new chat session"""
    data = request.get_json()
    session_id = str(uuid.uuid4())[:16]
    
    session = ChatSession(
        id=session_id,
        user_id=data.get('user_id'),
        agent_id=data.get('agent_id')
    )
    db.session.add(session)
    db.session.commit()
    
    return jsonify({'session_id': session_id})

# WebSocket events
@socketio.on('join_session')
def on_join(data):
    join_room(data['session_id'])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True, port=8001)
```

### **3. Chat Template (`chat.html`)**

**Location**: `/animus/control/templates/chat.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Animus Chat</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js"></script>
</head>
<body>
    <div id="chat-container">
        <div id="messages"></div>
        <input type="text" id="message-input" placeholder="Type your message...">
        <button onclick="sendMessage()">Send</button>
    </div>
    
    <script>
        const socket = io();
        let sessionId = null;
        
        // Create session on page load
        window.onload = async function() {
            const response = await fetch('/api/sessions/create', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    user_id: 'web_user',
                    agent_id: 'athena'
                })
            });
            const result = await response.json();
            sessionId = result.session_id;
            socket.emit('join_session', {session_id: sessionId});
        };
        
        function sendMessage() {
            const input = document.getElementById('message-input');
            const message = input.value;
            if (message.trim()) {
                fetch('/api/chat/send', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        session_id: sessionId,
                        message: message,
                        agent_id: 'athena'
                    })
                });
                input.value = '';
            }
        }
        
        socket.on('message_response', function(data) {
            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML += `<div><strong>Response:</strong> ${data.response}</div>`;
        });
    </script>
</body>
</html>
```

---

## WebSocket Implementation

### **Real-time Communication**

```python
from flask_socketio import emit, join_room, leave_room

@socketio.on('join_session')
def on_join_session(data):
    """Join WebSocket room for specific session"""
    session_id = data.get('session_id')
    join_room(session_id)
    emit('status', {'msg': f'Joined session {session_id}'}, room=session_id)

@socketio.on('leave_session')
def on_leave_session(data):
    """Leave WebSocket room"""
    session_id = data.get('session_id')
    leave_room(session_id)

@socketio.on('typing')
def on_typing(data):
    """Handle typing indicators"""
    session_id = data.get('session_id')
    emit('user_typing', {
        'user_id': data.get('user_id'),
        'is_typing': data.get('is_typing')
    }, room=session_id, include_self=False)
```

---

## Chat Widget Integration

### **Embeddable Widget (`static/chat_widget.js`)**

```javascript
class AnimusChatWidget {
    constructor(config) {
        this.sessionId = null;
        this.agentId = config.agentId || 'athena';
        this.apiBase = config.apiBase || '/api/chat';
        this.socket = io();
        
        this.initializeWidget();
        this.setupWebSocket();
    }
    
    initializeWidget() {
        // Create chat widget DOM
        this.widget = document.createElement('div');
        this.widget.className = 'animus-chat-widget';
        this.widget.innerHTML = this.getWidgetHTML();
        
        document.body.appendChild(this.widget);
        this.bindEvents();
    }
    
    setupWebSocket() {
        this.socket.on('message_response', (data) => {
            if (data.session_id === this.sessionId) {
                this.displayResponse(data.response);
            }
        });
        
        this.socket.on('user_typing', (data) => {
            this.showTypingIndicator(data.user_id, data.is_typing);
        });
    }
    
    async sendMessage(message) {
        if (!this.sessionId) {
            await this.createSession();
        }
        
        const response = await fetch(`${this.apiBase}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: this.sessionId,
                message: message,
                agent_id: this.agentId
            })
        });
        
        const result = await response.json();
        return result;
    }
    
    async createSession() {
        const response = await fetch(`${this.apiBase}/sessions/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: this.getUserId(),
                agent_id: this.agentId
            })
        });
        
        const result = await response.json();
        this.sessionId = result.session_id;
        
        // Join WebSocket room
        this.socket.emit('join_session', { session_id: this.sessionId });
    }
    
    getUserId() {
        // Get user ID from existing Animus authentication
        // This integrates with your existing user system
        return window.animusUserId || 'anonymous';
    }
}
```

---

## Integration with Animus Control System

### **1. Process Management**

Run the chat bridge alongside your main control system:

```bash
# Terminal 1: Main control system
cd /animus/control
python app.py

# Terminal 2: Chat bridge
cd /animus/control/chat_bridge
python app.py
```

**Note**: The chat bridge runs on port 8001, separate from your main control system.

### **2. Configuration Integration**

Add to `/animus/.env`:

```bash
# Chat Bridge Configuration
CHAT_BRIDGE_PORT=8001
CHAT_BRIDGE_HOST=127.0.0.1
BROCA_HOST=localhost
BROCA_PORT=8000
BROCA_API_KEY=your-broca-api-key
```

### **3. Health Monitoring**

Add to existing status pages:

```python
# In your existing health monitoring
def check_chat_bridge():
    try:
        response = requests.get('http://127.0.0.1:8001/health', timeout=5)
        return response.status_code == 200
    except:
        return False
```

---

## Deployment Considerations

### **1. Dependencies**

Minimal `requirements.txt`:

```
Flask==2.3.3
Flask-SocketIO==5.3.6
Flask-SQLAlchemy==3.0.5
requests==2.31.0
```

### **2. Environment Setup**

```bash
# Install dependencies
cd /animus/control/chat_bridge
pip install -r requirements.txt

# Run the chat bridge
python app.py

# Access chat interface at: http://localhost:8001
# Main control system at: http://localhost:5000 (or whatever port your main app uses)
```

### **3. Database Initialization**

Tables are created automatically when you run `python app.py` for the first time.

---

## Benefits of This Approach

### **1. Technical Benefits**
- **Python Ecosystem**: Seamless integration with existing Animus infrastructure
- **Performance**: WebSocket for real-time communication, no polling delays
- **Maintainability**: Single language, familiar patterns
- **Scalability**: Independent scaling of chat vs. control systems

### **2. Architectural Benefits**
- **Clean Separation**: Chat system independent of control interface
- **API-First Design**: RESTful endpoints for future extensibility
- **Session Persistence**: Reliable conversation history without complexity
- **Future-Proof**: Easy to add mobile apps, external integrations
- **Database Isolation**: Maintains separation from Broca databases for security

### **3. Operational Benefits**
- **Process Independence**: Chat failures don't affect control interface
- **Easy Monitoring**: Integrates with existing health check system
- **Simple Deployment**: Standard Python deployment patterns
- **Low Overhead**: Minimal resource usage, focused functionality

---

## Migration Path

### **Phase 1: Core Implementation**
1. Set up Flask application structure
2. Implement basic chat endpoints
3. Integrate with Broca messaging
4. Add session management

### **Phase 2: Real-time Features**
1. Implement WebSocket communication
2. Add typing indicators
3. Implement real-time message streaming
4. Add file handling capabilities

### **Phase 3: Advanced Features**
1. Multi-agent support
2. Rich media handling
3. Advanced session management
4. Performance optimization

### **Phase 4: Integration & Polish**
1. Full Animus control system integration
2. Health monitoring and logging
3. Error handling and recovery
4. Performance testing and optimization

---

## Conclusion

The Flask-based chat bridge provides the perfect balance of architectural benefits and implementation simplicity for the Animus system. By eliminating the PHP technology mismatch and unnecessary enterprise-level complexity, you get:

- **Clean separation** between chat and control interfaces
- **Python-native integration** with existing infrastructure
- **Real-time performance** without polling overhead
- **Session persistence** for reliable user experience
- **Future extensibility** for mobile apps and external integrations

This approach maintains the architectural advantages of the bridge pattern while providing a lightweight, maintainable solution that fits naturally within your existing Animus ecosystem.
