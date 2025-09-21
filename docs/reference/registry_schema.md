# Animus Registry Database Schema - Master Reference

## Overview
This document defines the **complete and authoritative database schema** for the Animus Configurator registry. This is the master schema that all implementation plans should reference.

**Note**: This schema includes all possible tables and features. For implementation planning, see `../planning/ui-database-schema-planning.md` which defines phased implementation and UI-specific requirements.

## Implementation Phases

### Phase 1: Core UI Support (Minimal Schema)
- `tools` - Tool definitions for settings grid
- `agents` - Agent management for chat interface  
- `users` - Basic user authentication

### Phase 2: User Management
- `user_sessions` - Web interface sessions
- `agent_configs` - Agent-specific configurations

### Phase 3: Configuration Management
- `system_config` - System-wide configuration
- `env_vars` - Environment variables
- `tool_instances` - Tool execution tracking

### Phase 4: Advanced Features
- `plugins` - Tool plugin management
- `configurations` - Hierarchical configuration system
- Enhanced chat integration tables

## Core Tables

### 1. Agents
The primary entities that users interact with - Athena, Monday, Timbre, etc.

**Note**: Agent visibility is controlled through `visible_to_users` and `visible_to_roles` fields, providing simple binary access control at the UI level. Agents themselves handle nuanced access levels through SEP (Animus Engagement Protocol).

```sql
agents
- id (PRIMARY KEY)
- letta_uid (VARCHAR, UNIQUE, NOT NULL) - Letta agent UID (required unique identifier)
- name (VARCHAR, NULL) - e.g., "Athena", "Monday", "Timbre" (optional but preferred)
- description (TEXT) - e.g., "Animus Configuration Assistant"
- status (ENUM) - "Healthy", "Degraded", "Off", "Ready"
- created_by (INTEGER, FOREIGN KEY -> users.id) - Who created this agent
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- config (JSON) - Agent-specific configuration
- is_active (BOOLEAN)
- visible_to_users (JSON) - [1, 5, 12] specific user IDs, or NULL for all users
- visible_to_roles (JSON) - ['admin', 'user'] specific roles, or NULL for all roles
```

### 2. Tools
The various tools and modules that can be managed through the system.

```sql
tools
- id (PRIMARY KEY)
- name (VARCHAR) - e.g., "System Settings", "Network Configuration"
- description (TEXT) - e.g., "Base ports, paths, environment variables"
- emoji (VARCHAR) - e.g., "⚙️", "🌐", "🔒"
- category (VARCHAR) - "master", "athena", "monday", "timbre", "smcp"
- status (ENUM) - "Healthy", "Degraded", "Off", "Ready"
- module_scope (ENUM) - "global" or "agent" - Whether module is system-wide or agent-specific
- config_schema (JSON) - Tool configuration schema
- created_by (INTEGER, FOREIGN KEY -> users.id) - Who created this tool
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_enabled (BOOLEAN)
```

### 3. Tool Instances
Individual instances of tools with their specific configurations.

```sql
tool_instances
- id (PRIMARY KEY)
- tool_id (FOREIGN KEY -> tools.id)
- agent_id (FOREIGN KEY -> agents.id) - NULL for master tools, required for agent tools
- name (VARCHAR) - Instance-specific name
- config (JSON) - Instance configuration
- status (ENUM) - "Healthy", "Degraded", "Off", "Ready"
- last_run (TIMESTAMP)
- next_run (TIMESTAMP) - For scheduled tools
- created_by (INTEGER, FOREIGN KEY -> users.id) - Who created this instance
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_active (BOOLEAN)
```

**Note**: 
- Global tools (MCP, Broca) can have multiple instances across agents
- Agent-specific tools have exactly one instance per agent (installed in agent's private folder)

### 4. Configurations
System-wide and agent-specific configuration settings.

```sql
configurations
- id (PRIMARY KEY)
- key (VARCHAR) - Configuration key
- value (TEXT) - Configuration value
- type (ENUM) - "string", "number", "boolean", "json"
- scope (VARCHAR) - "system", "agent", "tool", "user"
- scope_id (INTEGER) - ID of the scope entity (NULL for system)
- description (TEXT) - What this config controls
- is_encrypted (BOOLEAN) - For sensitive values
- created_by (INTEGER, FOREIGN KEY -> users.id) - Who created this config
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 5. Plugins
Tool-specific plugins and their configurations.

```sql
plugins
- id (PRIMARY KEY)
- tool_id (FOREIGN KEY -> tools.id, NOT NULL) - Parent tool this plugin belongs to
- name (VARCHAR) - Plugin name
- module_scope (ENUM) - "global" or "agent" - Inherits from parent tool
- version (VARCHAR) - Plugin version
- status (ENUM) - "Active", "Inactive", "Error"
- config (JSON) - Plugin configuration
- dependencies (JSON) - Required dependencies (within same tool)
- created_by (INTEGER, FOREIGN KEY -> users.id) - Who created this plugin
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_enabled (BOOLEAN)
```

**Note**: Plugins are always tied to a specific tool/module and cannot be shared across different tools.

### 6. Users
User accounts and permissions for system access control.

```sql
users
- id (PRIMARY KEY)
- username (VARCHAR, UNIQUE, NOT NULL) - Unique username
- email (VARCHAR, UNIQUE, NOT NULL) - User email
- password_hash (VARCHAR, NOT NULL) - Hashed password
- role (ENUM, NOT NULL) - "admin", "user", "viewer"
- permissions (JSON) - User-specific permissions
- last_login (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_active (BOOLEAN, DEFAULT true)
- failed_login_attempts (INTEGER, DEFAULT 0) - Track failed logins
- locked_until (TIMESTAMP, NULL) - Account lockout timestamp
```

### 7. User Sessions
Web interface user sessions for authentication.

```sql
user_sessions
- id (VARCHAR, 100) PRIMARY KEY
- user_id (INTEGER, FOREIGN KEY -> users.id, NOT NULL)
- session_token (VARCHAR, 255, NOT NULL)
- ip_address (VARCHAR, 45)
- user_agent (TEXT)
- expires_at (TIMESTAMP, NOT NULL)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

### 8. System Configuration
System-wide configuration settings.

```sql
system_config
- id (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- config_key (VARCHAR, 100, UNIQUE, NOT NULL)
- config_value (TEXT)
- config_type (VARCHAR, 20, DEFAULT 'string')
- description (TEXT)
- is_encrypted (BOOLEAN, DEFAULT false)
- category (VARCHAR, 50, DEFAULT 'general')
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

### 9. Environment Variables
Environment variable management.

```sql
env_vars
- id (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- var_name (VARCHAR, 100, UNIQUE, NOT NULL)
- var_value (TEXT)
- is_encrypted (BOOLEAN, DEFAULT false)
- description (TEXT)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

### 10. Agent Configurations
Agent-specific configuration settings.

```sql
agent_configs
- id (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- agent_id (VARCHAR, 50, NOT NULL)
- config_key (VARCHAR, 100, NOT NULL)
- config_value (TEXT)
- config_type (VARCHAR, 20, DEFAULT 'string')
- is_encrypted (BOOLEAN, DEFAULT false)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- FOREIGN KEY (agent_id) REFERENCES agents(id)
- UNIQUE(agent_id, config_key)
```

### 11. Chat Integration Tables
Enhanced chat system tables for user attribution.

```sql
web_chat_sessions
- id (VARCHAR, 64, PRIMARY KEY)
- uid (VARCHAR, 16, UNIQUE)
- user_id (INTEGER, FOREIGN KEY -> users.id)
- agent_id (VARCHAR, 50, FOREIGN KEY -> agents.id)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- last_active (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- ip_address (VARCHAR, 45)
- metadata (JSON)

web_chat_messages
- id (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- session_id (VARCHAR, 64, NOT NULL)
- message (TEXT, NOT NULL)
- timestamp (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- processed (BOOLEAN, DEFAULT false)
- broca_message_id (INTEGER)
- user_id (INTEGER, FOREIGN KEY -> users.id)
- FOREIGN KEY (session_id) REFERENCES web_chat_sessions(id)
```

## Relationships

### Agent-Tool Relationships
- **Global Tools** (module_scope = "global"): Available to all agents and master system
  - Examples: MCP, Broca, system-wide utilities
  - One tool definition, multiple tool_instances across agents
- **Agent-Specific Tools** (module_scope = "agent"): Installed in agent's private folder
  - Examples: Agent-specific modules, custom tools
  - One tool definition, one tool_instance per agent (or none)
- **Tool Instances**: Each agent gets their own instance of a tool with agent-specific configuration

### Configuration Relationships
- **One-to-Many**: System/agent/tool can have multiple configs
- **Hierarchical**: System → Agent → Tool → Instance configuration inheritance

### Plugin Relationships
- **Tool-Specific**: Each tool/module manages its own plugins
- **No Cross-Tool Sharing**: Plugins belong to their parent tool, not shared across tools
- **Module Scope**: Plugin scope follows the tool's module_scope (global vs agent)
- **Dependencies**: Plugins can depend on other plugins within the same tool
- **Examples**: 
  - MCP tool has MCP-specific plugins
  - Broca tool has Broca-specific plugins
  - Agent tools have agent-specific plugins

## Key Design Principles

1. **Flexibility**: JSON fields for complex configurations that vary by tool/agent
2. **Auditability**: Timestamps and user tracking for all changes
3. **Scalability**: Efficient indexing on frequently queried fields
4. **Security**: Encryption support for sensitive configuration values
5. **Extensibility**: Easy to add new agent types, tools, and plugins
6. **System Integration**: Cron jobs, logs, and backups managed directly at OS level to avoid sync issues and database bloat

## Security Features

1. **User Authentication**: Required login with password hashing
2. **Role-Based Access Control**: Admin, user, and viewer roles
3. **Stateless Authentication**: JWT tokens without server-side session storage
4. **Audit Trail**: All changes tracked by user
5. **Account Lockout**: Failed login attempt tracking
6. **Encrypted Configs**: Sensitive values can be encrypted
7. **Access Control**: All entities linked to creating user

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_agents_letta_uid ON agents(letta_uid);
CREATE INDEX idx_agents_created_by ON agents(created_by);
CREATE INDEX idx_tools_category ON tools(category);
CREATE INDEX idx_tools_module_scope ON tools(module_scope);
CREATE INDEX idx_tools_created_by ON tools(created_by);
CREATE INDEX idx_tool_instances_agent ON tool_instances(agent_id);
CREATE INDEX idx_tool_instances_created_by ON tool_instances(created_by);
CREATE INDEX idx_configurations_scope ON configurations(scope, scope_id);
CREATE INDEX idx_configurations_created_by ON configurations(created_by);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_plugins_tool ON plugins(tool_id);
CREATE INDEX idx_plugins_module_scope ON plugins(module_scope);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_agent_configs_agent ON agent_configs(agent_id);
CREATE INDEX idx_system_config_key ON system_config(config_key);
CREATE INDEX idx_env_vars_name ON env_vars(var_name);
CREATE INDEX idx_web_chat_sessions_user ON web_chat_sessions(user_id);
CREATE INDEX idx_web_chat_sessions_agent ON web_chat_sessions(agent_id);
```

## Future Considerations

1. **Versioning**: Tool and plugin version management
2. **Rollbacks**: Configuration change history and rollback capability
3. **Templates**: Pre-configured tool and agent templates
4. **API Keys**: External service integrations
5. **Metrics**: Performance and usage statistics
6. **Notifications**: Alert system for system events

## Module Discovery & Integration

### Manifest Requirements
Modules are discovered by Animus through `manifest.json` files. The format is designed to be minimal but extensible.

#### **Minimal Required Fields**
```json
{
  "name": "my-module",
  "type": "tool"
}
```

#### **Recommended Fields**
```json
{
  "name": "my-module",
  "type": "tool",
  "description": "Optional description",
  "version": "1.0.0",
  "module_scope": "agent"
}
```

#### **Advanced Fields (Optional)**
```json
{
  "name": "my-module",
  "type": "tool",
  "description": "Optional description",
  "version": "1.0.0",
  "module_scope": "agent",
  "config_schema": {}, // Optional config validation
  "dependencies": [], // Optional dependency list
  "entry_point": "main.py" // Optional if different from default
}
```

### Discovery Process
Animus automatically scans these locations for manifest files:
- `~/animus/agents/*/modules/*/manifest.json` - Agent-specific modules
- `~/animus/tools/*/manifest.json` - Global tools
- `~/animus/plugins/*/manifest.json` - Global plugins

### Design Philosophy
- **Low Barrier to Entry**: Just 2 fields required to get started
- **Progressive Enhancement**: Add more fields as needed
- **Graceful Fallbacks**: Animus handles missing optional fields
- **Developer Friendly**: No complex validation or rigid requirements

## Questions for Discussion

1. **Scope**: Should this support multiple Animus instances or just one?
2. **Users**: Do we need multi-user support or just single admin?
3. **Encryption**: What level of security is needed for sensitive configs?
4. **Performance**: Expected data volume and query patterns?
5. **Integration**: How does this connect with the existing Letta system?

## Implementation Notes

- **Phase 1 tables** are marked as essential for basic UI functionality
- **Phase 2-4 tables** add advanced features and full system capabilities
- **Field variations** between phases are documented in the implementation plan
- **Migration paths** from simple to complex schemas are provided

For detailed implementation planning and UI-specific requirements, see `../planning/ui-database-schema-planning.md`.

