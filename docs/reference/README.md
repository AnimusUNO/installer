# Reference Documentation

[![License: AGPLv3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0) [![Docs License: CC BY-SA 4.0](https://img.shields.io/badge/Docs%20License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![MCP Protocol](https://img.shields.io/badge/MCP-Protocol%20Compliant-green.svg)](https://modelcontextprotocol.io/)
[![Animus Core Module](https://img.shields.io/badge/Animus-Core%20Module-blue.svg)](https://animus.uno)

⚠️ **HEAVILY UNDER DEVELOPMENT - EARLY ALPHA** ⚠️

This folder contains technical reference documentation for the Animus system.

## 🚨 Development Status

**This project is in EARLY ALPHA and HEAVILY UNDER DEVELOPMENT.**

- **Current Focus**: The kernel loader is the primary payload
- **Target Platforms**: WSL, Ubuntu, and Raspbian systems (not tested on other platforms)
- **Stability**: Expect breaking changes, incomplete features, and potential data loss
- **Testing**: Limited testing has been performed - use at your own risk

## Contents

### Architecture & Design
- **`multi-agent-architecture.md`** - Multi-agent architecture guide and implementation details
- **`flask_chat_bridge_architecture.md`** - Technical architecture of the Flask chat bridge system

### API References
- **`letta-api-reference.md`** - Letta API endpoint documentation and specifications

### Database & Schema
- **`registry_schema.md`** - **MASTER** database schema reference for the Animus registry (complete schema)

### Installation & Criteria
- **`docs-on-installer-criteria.md`** - Installation criteria and requirements reference

## Usage

These documents serve as the authoritative reference for:
- System architecture decisions
- API specifications and endpoints
- **Complete database schema** (master reference)
- Installation requirements and criteria

## Maintenance

Reference documents should be updated when:
- Architecture changes are made
- New API endpoints are added
- **Database schema is modified** (update master schema first)
- Installation requirements change

**Important**: The `registry_schema.md` is the **master schema reference**. All implementation plans should reference this document rather than duplicating schema definitions.

Keep these documents current with the actual implementation to ensure accuracy.
