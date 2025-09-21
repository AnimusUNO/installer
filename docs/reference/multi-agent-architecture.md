# Multi-Agent Architecture Guide

## Overview

Animus: Broca 2 supports running multiple Letta agent instances through a simple, efficient architecture where each agent runs in its own completely isolated Broca instance. This provides complete isolation between agents while maintaining a clean, scalable structure.

## 🏗️ Architecture Principles

### 1. **Complete Instance Isolation**
- Each agent runs in its own completely isolated Broca instance
- Independent databases prevent any data cross-contamination
- Separate configuration, settings, and plugin instances per agent
- No shared Broca-specific resources between agents

### 2. **Shared Animus Resources**
- Only the Animus-wide virtual environment is shared (not Broca-specific)
- Common Python dependencies reduce disk usage and maintenance
- Each agent maintains its own complete Broca repository clone

### 3. **Simple 1:1 Mapping**
- Clear 1:1 mapping between agent IDs and instance folders
- Standardized folder structure for easy automation and management
- Each agent can be updated independently by pulling from their own Broca repository

## 📁 Directory Structure

```
~/animus/                    # Animus home directory
├── venv/                     # Animus-wide virtual environment (shared by all tools)
├── agent-721679f6-c8af-4e01-8677-dc042dc80368/  # Agent-specific instance
│   ├── broca/                # Complete Broca repository clone for this agent
│   │   ├── main.py
│   │   ├── runtime/
│   │   ├── plugins/
│   │   ├── cli/
│   │   ├── common/
│   │   ├── requirements.txt
│   │   └── ...
│   ├── .env                   # Agent-specific environment
│   ├── settings.json          # Agent-specific settings
│   ├── animus.db            # Agent-specific database
│   └── logs/                 # Agent-specific logs
├── agent-9a2b3c4d-5e6f-7890-abcd-ef1234567890/  # Another agent
│   ├── broca/                # Complete Broca repository clone for this agent
│   │   ├── main.py
│   │   ├── runtime/
│   │   ├── plugins/
│   │   ├── cli/
│   │   ├── common/
│   │   ├── requirements.txt
│   │   └── ...
│   ├── .env
│   ├── settings.json
│   ├── animus.db
│   └── logs/
└── other-animus-tools/      # Other Animus tools (shared venv)
    ├── tool1/
    └── tool2/
```

## 🚀 Setup Instructions

### Step 1: Create Animus Directory Structure

```bash
# Choose your master folder (typically your home directory or a dedicated user folder)
mkdir ~/animus
cd ~/animus

# Create the Animus-wide virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 2: Create Agent-Specific Instances

```bash
# For each Letta agent, create a folder named after the agent ID
mkdir ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368
cd ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368

# Clone a complete Broca repository for this agent
git clone https://github.com/animus/broca.git broca

# Note: Virtual environment is managed at the Animus level, not per Broca instance
# The venv in ~/animus/venv/ is shared by all Animus tools
```

### Step 3: Configure Agent-Specific Instances

```bash
# Copy base configuration from the cloned repository
cp ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368/broca/.env.example ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368/.env
cp ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368/broca/settings.json ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368/

# Edit agent-specific configuration
nano ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368/.env

# Set agent-specific variables
AGENT_ENDPOINT=https://your-letta-instance.com/api/v1
AGENT_API_KEY=your_agent_specific_api_key
# Add other agent-specific settings as needed
```

### Step 4: Install Dependencies and Run

```bash
# Activate the Animus-wide virtual environment
source ~/animus/venv/bin/activate  # On Windows: ~/animus/venv/Scripts/activate

# Install dependencies for the Broca instance
cd ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368/broca
pip install -r requirements.txt

# Run the instance from the agent's Broca clone
python main.py

# Or use the CLI tools
python -m cli.btool queue list
python -m cli.btool users list
```

## 🔧 Configuration Management

### Environment Variables

#### Agent Instance (.env in agent-{uuid}/)
```bash
# Agent configuration (agent-specific)
AGENT_ENDPOINT=https://your-letta-instance.com/api/v1
AGENT_API_KEY=your_agent_specific_api_key

# Agent-specific settings
MESSAGE_MODE=live
QUEUE_REFRESH=5
MAX_RETRIES=3
DEBUG_MODE=false

# Platform-specific settings (e.g., Telegram)
TELEGRAM_API_ID=your_telegram_api_id
TELEGRAM_API_HASH=your_telegram_api_hash
TELEGRAM_PHONE=your_phone_number
```

### Settings Files

#### Agent Settings (settings.json in agent-{uuid}/)
```json
{
  "agent": {
    "id": "721679f6-c8af-4e01-8677-dc042dc80368",
    "name": "My Agent",
    "description": "Agent for specific tasks"
  },
  "message_processing": {
    "mode": "live",
    "queue_refresh": 5,
    "max_retries": 3
  },
  "plugins": {
    "telegram": {
      "enabled": true,
      "parse_mode": "MarkdownV2"
    }
  }
}
```

## 🚦 Running Multiple Instances

### Manual Startup

```bash
# Terminal 1: Start first agent
cd ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368

# Activate the Animus-wide virtual environment
source ~/animus/venv/bin/activate  # On Windows: ~/animus/venv/Scripts/activate

# Run the instance from the agent's Broca clone
python broca/main.py

# Terminal 2: Start second agent
cd ~/animus/agent-9a2b3c4d-5e6f-7890-abcd-ef1234567890

# Activate the Animus-wide virtual environment
source ~/animus/venv/bin/activate  # On Windows: ~/animus/venv/Scripts/activate

# Run the instance from the agent's Broca clone
python broca/main.py
```

### Process Manager (PM2)

```bash
# Install PM2 if not already installed
npm install -g pm2

# Start agents with PM2
cd ~/animus

pm2 start "broca-agent-1" --interpreter ~/animus/venv/bin/python -- ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368/broca/main.py
pm2 start "broca-agent-2" --interpreter ~/animus/venv/bin/python -- ~/animus/agent-9a2b3c4d-5e6f-7890-abcd-ef1234567890/broca/main.py

# Monitor processes
pm2 list
pm2 logs

# Stop agents
pm2 stop broca-agent-1
pm2 stop broca-agent-2
```

### Systemd Services

```bash
# Create systemd service file for each agent
sudo nano /etc/systemd/system/broca-agent-1.service

[Unit]
Description=Broca Agent 1
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/home/your_username/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368
ExecStart=/home/your_username/animus/venv/bin/python broca/main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable and start services
sudo systemctl enable broca-agent-1
sudo systemctl start broca-agent-1
sudo systemctl status broca-agent-1
```

## 📊 Monitoring and Management

### CLI Tools

```bash
# Queue management for specific agent
cd ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368

# Activate the Animus-wide virtual environment
source ~/animus/venv/bin/activate  # On Windows: ~/animus/venv/Scripts/activate

# Use CLI tools from the agent's Broca clone
python -m broca.cli.btool queue list
python -m broca.cli.btool queue flush

# User management
python -m broca.cli.btool users list

# Settings management
python -m broca.cli.ctool settings show
python -m broca.cli.ctool settings set message_mode live
```

### Log Management

```bash
# View agent-specific logs
cd ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368
tail -f logs/broca.log

# Log rotation and cleanup
find ~/animus/agent-*/logs -name "*.log" -mtime +7 -delete
```

### Database Management

```bash
# Backup agent-specific databases
cd ~/animus
mkdir -p backups/$(date +%Y%m%d)

# Backup all agent databases
for agent_dir in agent-*/; do
    agent_id=$(basename "$agent_dir")
    cp "$agent_dir/animus.db" "backups/$(date +%Y%m%d)/${agent_id}_animus.db"
done

# Restore specific agent database
cp backups/20241201/agent-721679f6-c8af-4e01-8677-dc042dc80368_animus.db \
   agent-721679f6-c8af-4e01-8677-dc042dc80368/animus.db
```

## 🔄 Updates and Maintenance

### Base Installation Updates

```bash
# Update each agent's Broca repository independently
cd ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368/broca
git pull origin main

# Update Animus-wide virtual environment
cd ~/animus
source venv/bin/activate
pip install -r agent-721679f6-c8af-4e01-8677-dc042dc80368/broca/requirements.txt

# Restart specific agent instance
pm2 restart broca-agent-1
# or
sudo systemctl restart broca-agent-1
```

### Agent-Specific Updates

```bash
# Update agent configuration
cd ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368

# Edit configuration
nano .env
nano settings.json

# Restart specific agent
pm2 restart broca-agent-1
# or
sudo systemctl restart broca-agent-1
```

### Plugin Updates

```bash
# Update plugins in each agent's Broca repository
cd ~/animus/agent-721679f6-c8af-4e01-8677-dc042dc80368/broca
git pull origin main

# Restart agent to pick up plugin changes
pm2 restart broca-agent-1
```

## 🛡️ Security Considerations

### Isolation

- Each agent runs with its own complete Broca repository, database, and configuration
- No shared credentials between agents
- Separate log files prevent information leakage
- Complete isolation prevents cross-agent data access

### Access Control

```bash
# Set proper permissions for agent directories
chmod 700 ~/animus/agent-*/
chmod 600 ~/animus/agent-*/.env
chmod 600 ~/animus/agent-*/settings.json

# Restrict access to shared virtual environment
chmod 755 ~/animus/venv/
```

### Backup Security

```bash
# Encrypt backups
tar -czf - ~/animus/agent-*/animus.db | \
gpg --encrypt --recipient your-email@example.com > \
~/animus/backups/$(date +%Y%m%d)_encrypted.tar.gz.gpg
```

## 🔍 Troubleshooting

### Common Issues

#### 1. **Agent Can't Start**
```bash
# Check environment variables
cd ~/animus/agent-{uuid}
cat .env

# Verify virtual environment activation
source ~/animus/venv/bin/activate
python -c "import telethon; print('Telethon OK')"

# Check logs
tail -f logs/broca.log
```

#### 2. **Database Connection Issues**
```bash
# Verify database file exists
ls -la ~/animus/agent-{uuid}/animus.db

# Check database permissions
chmod 644 ~/animus/agent-{uuid}/animus.db

# Test database connection
cd ~/animus/agent-{uuid}
source ~/animus/venv/bin/activate
python -m broca.cli.btool queue list
```

#### 3. **Plugin Loading Issues**
```bash
# Check plugin configuration
cat ~/animus/agent-{uuid}/settings.json

# Verify plugin files exist
ls -la ~/animus/agent-{uuid}/broca/plugins/

# Check plugin logs
tail -f ~/animus/agent-{uuid}/logs/broca.log
```

### Performance Monitoring

```bash
# Monitor resource usage
htop
iotop
df -h

# Check agent-specific resource usage
ps aux | grep "agent-"
lsof | grep "agent-"

# Monitor database performance
cd ~/animus/agent-{uuid}
source ~/animus/venv/bin/activate
python -m broca.cli.btool queue stats
```

## 🚀 Advanced Features

### Automated Deployment

```bash
#!/bin/bash
# deploy-agent.sh - Automated agent deployment script

AGENT_ID=$1
AGENT_ENDPOINT=$2
AGENT_API_KEY=$3

if [ -z "$AGENT_ID" ] || [ -z "$AGENT_ENDPOINT" ] || [ -z "$AGENT_API_KEY" ]; then
    echo "Usage: $0 <agent_id> <endpoint> <api_key>"
    exit 1
fi

cd ~/animus

# Create agent directory
mkdir -p "agent-${AGENT_ID}"
cd "agent-${AGENT_ID}"

# Clone Broca repository for this agent
git clone https://github.com/animus/broca.git broca

# Copy configuration templates
cp broca/.env.example .env
cp broca/settings.json .

# Configure agent-specific settings
sed -i "s|AGENT_ENDPOINT=.*|AGENT_ENDPOINT=${AGENT_ENDPOINT}|" .env
sed -i "s/AGENT_API_KEY=.*/AGENT_API_KEY=${AGENT_API_KEY}/" .env

# Create logs directory
mkdir -p logs

echo "Agent ${AGENT_ID} deployed successfully!"
echo "Start with: cd agent-${AGENT_ID} && source ~/animus/venv/bin/activate && python broca/main.py"
```

### Health Monitoring

```bash
#!/bin/bash
# health-check.sh - Monitor all agent instances

cd ~/animus

echo "Animus: Broca 2 Agent Health Check"
echo "==================================="

for agent_dir in agent-*/; do
    agent_id=$(basename "$agent_dir")
    echo -n "Agent ${agent_id}: "
    
    if [ -f "${agent_dir}/animus.db" ]; then
        echo -n "DB ✓ "
    else
        echo -n "DB ✗ "
    fi
    
    if [ -f "${agent_dir}/.env" ]; then
        echo -n "ENV ✓ "
    else
        echo -n "ENV ✗ "
    fi
    
    if [ -d "${agent_dir}/broca" ]; then
        echo -n "BROCA ✓ "
    else
        echo -n "BROCA ✗ "
    fi
    
    if [ -d "${agent_dir}/logs" ]; then
        echo -n "LOGS ✓ "
    else
        echo -n "LOGS ✗ "
    fi
    
    echo ""
done

echo ""
echo "Virtual Environment:"
if [ -d "venv" ]; then
    echo "✓ Virtual environment exists"
    source venv/bin/activate
    python --version
else
    echo "✗ Virtual environment missing"
fi
```

## 🔮 Planned Updates

### Broca MCP Server
A new Management Control Panel server will be added to manage multiple Broca instances:
- Instance Management: Deploy, monitor, and update Broca instances
- Agent Configuration: Manage Letta agent credentials and settings
- Monitoring & Logging: Centralized logging and performance metrics
- Resource Management: Monitor shared resources and system health
- Security: Centralized credential management and access control

## 📚 Additional Resources

- [Main README](../README.md) - Complete project overview
- [CLI Reference](cli_reference.md) - Command-line tool documentation
- [Configuration Guide](configuration.md) - Detailed configuration options
- [Plugin Development](plugin_development.md) - Creating custom plugins
- [Telegram Plugin](telegram-plugin-spec.md) - Telegram integration details

## 🤝 Contributing

When contributing to the multi-agent architecture:

1. **Maintain Isolation**: Ensure changes don't break agent isolation
2. **Repository Structure**: Each agent maintains its own complete Broca repository
3. **Configuration**: Support agent-specific settings and configurations
4. **Testing**: Test with multiple agent instances
5. **Documentation**: Update this guide for any architectural changes

## 🤖 Acknowledgments

- Original Broca project (It was me).
- Contributors and maintainers (Also me).
- Community support (the AI agents I made to help me).
