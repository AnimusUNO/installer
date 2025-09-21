# Animus Documentation

⚠️ **HEAVILY UNDER DEVELOPMENT - EARLY ALPHA** ⚠️

This folder contains all documentation for the Animus system, organized into logical categories for easy navigation.

## 🚨 Development Status

**This project is in EARLY ALPHA and HEAVILY UNDER DEVELOPMENT.**

- **Current Focus**: The kernel loader is the primary payload
- **Target Platforms**: WSL, Ubuntu, and Raspbian systems (not tested on other platforms)
- **Stability**: Expect breaking changes, incomplete features, and potential data loss
- **Testing**: Limited testing has been performed - use at your own risk

## 📜 Licensing

**Code**: Licensed under [GNU Affero General Public License v3.0](../LICENSE) (AGPLv3)  
**Documentation & Data**: Licensed under [Creative Commons Attribution-ShareAlike 4.0](../LICENSE-DOCS) (CC-BY-SA 4.0)

**Important**: This project uses a dual-license structure:
- **Executable code** (Python, JavaScript, CSS, HTML, SQL) is under AGPLv3
- **Documentation, schemas, and data** are under CC-BY-SA 4.0

See [LICENSING.md](../LICENSING.md) for complete details and [LICENSE](../LICENSE) and [LICENSE-DOCS](../LICENSE-DOCS) for full license texts.



## Organization

### 📚 [Reference Documentation](./reference/)
**Technical specifications, architecture, and API references**

Contains authoritative reference materials that define:
- System architecture and design decisions
- API specifications and endpoints
- **Complete database schema** (master reference)
- Installation requirements and criteria

**Use these documents when you need to:**
- Understand how the system works
- Reference API endpoints
- **Check complete database schema** (master reference)
- Verify installation requirements

### 📋 [Planning Documentation](./planning/)
**Project plans, implementation strategies, and design decisions**

Contains implementation roadmaps and planning materials for:
- **Database schema development** (phased implementation)
- Feature integration planning
- Installation and deployment strategies
- UI/UX design decisions

**Use these documents when you need to:**
- **Plan database implementation** (phased approach)
- Understand development priorities
- Reference implementation strategies
- Review design decisions

## Quick Navigation

### For Developers
- **Getting Started**: Start with `planning/ui-database-schema-planning.md` (implementation plan)
- **Complete Schema**: Reference `reference/registry_schema.md` (master schema)
- **Architecture**: Reference `reference/multi-agent-architecture.md`
- **API Integration**: Check `reference/letta-api-reference.md`

### For System Administrators
- **Installation**: Review `planning/core-installation-planning.md`
- **Requirements**: Check `reference/docs-on-installer-criteria.md`
- **Configuration**: See `planning/system_settings_planning.md`

### For UI/UX Work
- **Interface Design**: Review `planning/design for web interface.md`
- **Database Schema**: Check `reference/registry_schema.md` (master schema)
- **Chat Integration**: See `planning/flask-chat-integration-plan.md`

## Document Relationships

### **Master Schema + Implementation Plan**
- **`reference/registry_schema.md`**: Complete database schema (what to build)
- **`planning/ui-database-schema-planning.md`**: Implementation plan (how to build it)

This structure eliminates duplication:
- **Schema definitions** are only in the master reference
- **Implementation steps** reference the master schema
- **Changes** only need to be made in one place

## Document Maintenance

### Reference Documents
- Update when architecture or APIs change
- **Update master schema first** when database changes are made
- Keep current with actual implementation
- Maintain accuracy and completeness

### Planning Documents
- Update when priorities or approaches change
- **Reference master schema** rather than duplicating definitions
- Align with current reference documentation
- Reflect current implementation status

## Contributing

When adding new documentation:
1. **Determine the type**: Reference (how it works) vs Planning (how to implement)
2. **Place in appropriate folder**: Reference or Planning
3. **Update relevant README files**: Add to the appropriate content list
4. **Maintain consistency**: Ensure alignment with existing documents
5. **Avoid duplication**: Reference existing documents rather than copying content

## Questions?

If you're unsure where to place a document or need help finding specific information:
- **For complete schema**: Check `reference/registry_schema.md`
- **For implementation steps**: Check `planning/ui-database-schema-planning.md`
- **For other topics**: Check the README files in each subfolder for detailed content descriptions
