# Animus Licensing Structure

## Overview

Animus uses a **dual-license structure** to ensure appropriate licensing for different types of content:

- **Code**: GNU Affero General Public License v3.0 (AGPLv3)
- **Documentation & Data**: Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA 4.0)

## License Files

### Main Project License
- **`LICENSE`**: AGPLv3 for all executable code
- **`LICENSE-DOCS`**: CC-BY-SA 4.0 for documentation and data

## What Gets Which License

### AGPLv3 (Code)
**Applies to:**
- Python source code (`.py` files)
- JavaScript files (`.js` files)
- CSS stylesheets (`.css` files)
- HTML templates (`.html` files)
- Database schemas and initialization scripts (`.sql` files)
- Configuration files (`.ini`, `.cfg`, `.json` for code configuration)
- Build scripts and automation tools
- Requirements and dependency specifications

**Key Requirements:**
- Source code must be available to users
- Network use triggers source code distribution requirements
- Derivative works must also be AGPLv3
- Full license text available at: https://www.gnu.org/licenses/

### CC-BY-SA 4.0 (Documentation & Data)
**Applies to:**
- README files (`.md` files)
- API documentation
- User guides and tutorials
- Planning documents
- Data schemas and specifications
- Configuration examples and templates
- Agent definitions (`.af` files)
- Any other non-executable content

**Key Requirements:**
- Attribution required
- ShareAlike: derivative works must use same license
- Full license text available at: https://creativecommons.org/licenses/by-sa/4.0/

## Implementation

### Code Files
All code files include AGPLv3 headers:

```python
"""
Animus Control Interface - [Module Name]
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
```

### HTML Templates
All HTML templates include AGPLv3 headers:

```html
<!--
  Animus Control Interface - [Template Name]
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
-->
```

### JavaScript Files
All JavaScript files include AGPLv3 headers:

```javascript
/**
 * Animus Control Interface - [File Name]
 * Copyright (c) 2025 Mark Rizzn Hopkins
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
```

### CSS Files
All CSS files include AGPLv3 headers:

```css
/**
 * Animus Control Interface - [File Name]
 * Copyright (c) 2025 Mark Rizzn Hopkins
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
```

### SQL Files
All SQL files include AGPLv3 headers:

```sql
-- Copyright (c) 2025 Mark Rizzn Hopkins
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU Affero General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU Affero General Public License for more details.
--
-- You should have received a copy of the GNU Affero General Public License
-- along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

## Why This Structure?

### AGPLv3 for Code
- **Network Use**: AGPLv3 ensures that if you run modified versions of Animus on a network server, users must have access to the source code
- **Copyleft**: Ensures that improvements and modifications remain open source
- **Community**: Promotes collaboration and prevents proprietary forks

### CC-BY-SA 4.0 for Documentation
- **Flexibility**: Allows for easier sharing and adaptation of documentation
- **Attribution**: Ensures credit is given to original authors
- **ShareAlike**: Maintains openness while allowing commercial use

## Compliance

### For Contributors
- **Code contributions**: Automatically licensed under AGPLv3
- **Documentation contributions**: Automatically licensed under CC-BY-SA 4.0
- **New files**: Must include appropriate license headers

### For Users
- **Running Animus**: AGPLv3 applies
- **Modifying code**: AGPLv3 applies
- **Using documentation**: CC-BY-SA 4.0 applies
- **Distributing**: Must comply with both licenses

### For Commercial Use
- **Code**: AGPLv3 allows commercial use but requires source code availability
- **Documentation**: CC-BY-SA 4.0 allows commercial use with attribution and sharealike requirements

## Questions?

If you have questions about licensing:
- **Code licensing**: See `LICENSE` file or https://www.gnu.org/licenses/
- **Documentation licensing**: See `LICENSE-DOCS` file or https://creativecommons.org/licenses/by-sa/4.0/
- **General questions**: Contact the project maintainers

---

**Note**: This document is itself licensed under CC-BY-SA 4.0 as it is documentation.
