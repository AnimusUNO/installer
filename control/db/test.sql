-- Test Database Setup for Development
-- This file loads ONLY Iris agent for UI development
-- NOT for production bootstrap - production will use Letta kernel auto-detection
--
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

-- Clear existing test data
DELETE FROM agents WHERE name = 'Iris';

-- Insert Iris test agent based on Iris.af data
INSERT INTO agents (
    id,
    letta_uid,
    name,
    description,
    status,
    created_by,
    config,
    is_active,
    visible_to_users,
    visible_to_roles
) VALUES (
    'iris',
    'iris_letta_001',
    'Iris',
    'Iris is the flagship Animus agent—an adaptive operator–oracle that orchestrates tools, deepens user context, and speaks with clarity and care. She''s the opposite of Siri. Get it?',
    'Healthy',
    1, -- created_by admin
    '{"version": "0.8.3", "embedding_model": "letta-free", "context_window": 8192, "temperature": 0.7, "max_tokens": 4096, "persona_version": "v1", "core_memory_blocks": ["SEP", "persona", "human"], "tool_count": 6, "is_default": true, "test_data": true}',
    true,
    NULL, -- visible to all users for testing
    NULL  -- visible to all roles for testing
);

-- Display test data summary
SELECT 'Test data loaded successfully!' as status;
SELECT 'Test Agents:' as agent_info, name, status FROM agents WHERE name = 'Iris';
