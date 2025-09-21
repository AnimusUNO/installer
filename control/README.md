# Animus Control Interface - Authentication System

⚠️ **HEAVILY UNDER DEVELOPMENT - EARLY ALPHA** ⚠️

## 📜 Licensing

**Code**: Licensed under [GNU Affero General Public License v3.0](../LICENSE) (AGPLv3)  
**Documentation**: Licensed under [Creative Commons Attribution-ShareAlike 4.0](../LICENSE-DOCS) (CC-BY-SA 4.0)

## 🚨 Development Status

**This project is in EARLY ALPHA and HEAVILY UNDER DEVELOPMENT.**

- **Current Focus**: The kernel loader is the primary payload
- **Target Platforms**: WSL, Ubuntu, and Raspbian systems (not tested on other platforms)
- **Stability**: Expect breaking changes, incomplete features, and potential data loss
- **Testing**: Limited testing has been performed - use at your own risk

## Overview
This is the Phase 1 implementation of the Animus UI Database Schema Plan, focusing on user management and authentication.

## Features Implemented

### ✅ Authentication System
- **Login/Logout**: Secure user authentication with bcrypt password hashing
- **Session Management**: 24-hour session tokens with automatic cleanup
- **Role-Based Access**: Admin and user roles with different permissions
- **Security Features**: Account lockout after 5 failed attempts, rate limiting

### ✅ Database Integration
- **User Management**: Complete user CRUD operations
- **Agent Visibility**: Users see different agents based on permissions
- **Session Tracking**: Database-backed session management

### ✅ UI Integration
- **Login Page**: Clean, responsive login interface
- **User Info Display**: Shows current user and role in header
- **Logout Functionality**: Secure logout with session cleanup
- **Authentication Checks**: All routes protected with proper decorators

## Quick Start

### 1. Initialize Database
```bash
cd control
python -c "from models import init_db; init_db(); print('Database initialized')"
```

### 2. Set Admin Password
```bash
python setup_admin.py
```

### 3. Start the Application
```bash
python app.py
```

### 4. Access the Interface
- **URL**: http://127.0.0.1:5000
- **Default Admin**: `admin` / (password set in step 2)

## API Endpoints

### Authentication
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /logout` - Logout user

### Protected Routes
- `GET /` - Main chat interface (requires auth)
- `GET /settings` - Settings page (requires auth)
- `GET /system-settings` - System settings (requires admin)

### API Endpoints
- `GET /api/agents` - Get user-visible agents (requires auth)
- `GET /api/users` - Get all users (requires admin)
- `PUT /api/users/<id>` - Update user (requires admin)
- `PUT /api/agents/<id>` - Update agent (requires admin)

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password_hash` - Bcrypt hashed password
- `role` - 'admin', 'user', 'viewer'
- `permissions` - JSON permissions
- `is_active` - Account status
- `failed_login_attempts` - Security tracking
- `locked_until` - Account lockout

### User Sessions Table
- `id` - Session ID
- `user_id` - Foreign key to users
- `session_token` - Secure token
- `expires_at` - Session expiration
- `ip_address` - Client IP
- `user_agent` - Browser info

### Agents Table
- `id` - Agent ID
- `letta_uid` - Broca integration ID
- `name` - Display name
- `description` - Agent description
- `status` - Health status
- `visible_to_users` - JSON array of user IDs
- `visible_to_roles` - JSON array of roles

## Security Features

### Password Security
- Bcrypt hashing with salt
- Minimum 6 character requirement
- Secure password verification

### Session Security
- 64-character random tokens
- 24-hour expiration
- Automatic cleanup of expired sessions
- IP and user agent tracking

### Access Control
- Role-based permissions
- Account lockout after failed attempts
- Secure session validation
- CSRF protection via Flask

## Agent Visibility Control

### Default Setup
- **Athena**: Visible to all users
- **Monday**: Admin only
- **Timbre**: Admin only

### Customization
```sql
-- Give specific user access to Monday
UPDATE agents 
SET visible_to_users = JSON_ARRAY(2, 5) 
WHERE id = 'monday';

-- Make agent visible to specific roles
UPDATE agents 
SET visible_to_roles = JSON_ARRAY('admin', 'user') 
WHERE id = 'timbre';
```

## Next Steps (Phase 2)

1. **Chat Integration**: Link chat sessions to authenticated users
2. **Simple UID Integration**: Map Sanctum users to Broca Letta IDs
3. **Chat History**: User-specific chat history
4. **Agent Switching**: Maintain user context across agents

## Troubleshooting

### Common Issues

**Login not working:**
- Check database initialization: `python -c "from models import init_db; init_db()"`
- Verify admin password: `python setup_admin.py`
- Check database file exists: `ls control/db/animus_ui.db`

**Session expired:**
- Sessions expire after 24 hours
- Clear browser cookies and login again
- Check server time synchronization

**Permission denied:**
- Verify user role in database
- Check route decorators in app.py
- Ensure proper session data

### Database Reset
```bash
rm control/db/animus_ui.db
python -c "from models import init_db; init_db()"
python setup_admin.py
```

## Development Notes

- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: Flask sessions with database backing
- **Security**: Bcrypt for passwords, secure tokens for sessions
- **UI**: Bootstrap 5 with custom CSS
- **JavaScript**: Vanilla JS with fetch API

## Files Structure

```
control/
├── app.py              # Main Flask application
├── auth.py             # Authentication functions
├── models.py           # SQLAlchemy models
├── setup_admin.py      # Admin password setup
├── db/
│   ├── animus_ui.db   # SQLite database
│   └── init_database.sql # Schema initialization
├── templates/
│   ├── login.html      # Login page
│   ├── index.html       # Main chat interface
│   └── includes/
│       └── header.html  # Shared header
└── static/
    ├── styles.css      # Custom styles
    └── chat.js         # Chat functionality
```
