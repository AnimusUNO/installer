/**
 * Animus Control Interface - User Management JavaScript
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

// User Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeUserManagement();
});

function initializeUserManagement() {
    loadExistingUsers();
    
    document.getElementById('discoverUsers').addEventListener('click', discoverUsers);
    document.getElementById('addUser').addEventListener('click', showAddUserModal);
    document.getElementById('userSearch').addEventListener('input', filterUsers);
    document.getElementById('roleFilter').addEventListener('change', filterUsers);
    
    document.getElementById('promotionForm').addEventListener('submit', handleUserPromotion);
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    document.getElementById('editUserForm').addEventListener('submit', handleUserEdit);
}

async function loadExistingUsers() {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-muted">
                Loading users...
            </td>
        </tr>
    `;
    
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const users = await response.json();
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        No users found
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td class="text-light">${user.username}</td>
                <td class="text-light">${user.email}</td>
                <td><span class="badge bg-${getRoleBadgeColor(user.role)}">${user.role}</span></td>
                <td><span class="badge bg-${user.is_active ? 'success' : 'danger'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
                <td class="text-muted">${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary btn-sm" onclick="editUser(${user.id})" title="Edit User">
                            ✏️
                        </button>
                        <button class="btn btn-outline-${user.is_active ? 'warning' : 'success'} btn-sm" onclick="toggleUserStatus(${user.id}, ${user.is_active})" title="${user.is_active ? 'Deactivate' : 'Activate'}">
                            ${user.is_active ? '⏸️' : '▶️'}
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteUser(${user.id})" title="Delete User">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading users:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Error loading users: ${error.message}
                </td>
            </tr>
        `;
    }
}

function getRoleBadgeColor(role) {
    switch (role) {
        case 'admin': return 'danger';
        case 'user': return 'primary';
        case 'viewer': return 'secondary';
        default: return 'secondary';
    }
}

async function discoverUsers() {
    const button = document.getElementById('discoverUsers');
    const originalText = button.textContent;
    
    button.disabled = true;
    button.textContent = '🔍 Discovering...';
    
    try {
        const response = await fetch('/api/users/discover', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const discoveredUsers = await response.json();
        
        // Show discovered users section
        const discoveredUsersDiv = document.getElementById('discoveredUsers');
        discoveredUsersDiv.style.display = 'block';
        
        const userGrid = document.getElementById('userGrid');
        
        if (discoveredUsers.length === 0) {
            userGrid.innerHTML = `
                <div class="alert alert-info">
                    <strong>No users found:</strong> No new users discovered in Broca database.
                </div>
            `;
        } else {
            userGrid.innerHTML = `
                <div class="alert alert-success mb-3">
                    <strong>Found ${discoveredUsers.length} users</strong> in Broca database
                </div>
                <div class="table-responsive">
                    <table class="table table-dark table-hover">
                        <thead>
                            <tr>
                                <th class="text-light">Username</th>
                                <th class="text-light">Email</th>
                                <th class="text-light">Last Interaction</th>
                                <th class="text-light">Interaction Count</th>
                                <th class="text-light">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${discoveredUsers.map(user => `
                                <tr>
                                    <td class="text-light">${user.username}</td>
                                    <td class="text-light">${user.email}</td>
                                    <td class="text-muted">${new Date(user.last_interaction).toLocaleDateString()}</td>
                                    <td class="text-muted">${user.interaction_count}</td>
                                    <td>
                                        <button class="btn btn-success btn-sm" onclick="promoteUser('${user.username}', '${user.email}')">
                                            ➕ Promote to Animus
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error discovering users:', error);
        const userGrid = document.getElementById('userGrid');
        userGrid.innerHTML = `
            <div class="alert alert-danger">
                <strong>Error:</strong> Failed to discover users: ${error.message}
            </div>
        `;
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

async function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value;
    const roleFilter = document.getElementById('roleFilter').value;
    
    try {
        // Build query parameters
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (roleFilter) params.append('role', roleFilter);
        
        const response = await fetch(`/api/users?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const users = await response.json();
        
        const tbody = document.getElementById('userTableBody');
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        No users found matching your criteria
                    </td>
                </tr>
            `;
            return;
        }
        
        // Re-render the table with filtered results
        tbody.innerHTML = users.map(user => `
            <tr>
                <td class="text-light">${user.username}</td>
                <td class="text-light">${user.email}</td>
                <td><span class="badge bg-${getRoleBadgeColor(user.role)}">${user.role}</span></td>
                <td><span class="badge bg-${user.is_active ? 'success' : 'danger'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
                <td class="text-muted">${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary btn-sm" onclick="editUser(${user.id})" title="Edit User">
                            ✏️
                        </button>
                        <button class="btn btn-outline-${user.is_active ? 'warning' : 'success'} btn-sm" onclick="toggleUserStatus(${user.id}, ${user.is_active})" title="${user.is_active ? 'Deactivate' : 'Activate'}">
                            ${user.is_active ? '⏸️' : '▶️'}
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteUser(${user.id})" title="Delete User">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error filtering users:', error);
        showAlert('danger', `Failed to filter users: ${error.message}`);
    }
}

// Helper function to show alerts
function showAlert(type, message) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the main content
    const main = document.querySelector('main');
    main.insertBefore(alertDiv, main.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

async function handleUserPromotion(event) {
    event.preventDefault();
    
    const userData = {
        username: document.getElementById('promoteUsername').value,
        email: document.getElementById('promoteEmail').value,
        role: document.getElementById('promoteRole').value
    };
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create user');
        }
        
        const result = await response.json();
        
        // Show success message
        showAlert('success', `User ${userData.username} created successfully! Default password: changeme123`);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('promotionModal'));
        modal.hide();
        
        // Reset form
        event.target.reset();
        
        // Reload users
        loadExistingUsers();
        
    } catch (error) {
        console.error('Error creating user:', error);
        showAlert('danger', `Failed to create user: ${error.message}`);
    }
}

function promoteUser(username, email) {
    // Pre-fill the promotion modal with discovered user data
    document.getElementById('promoteUsername').value = username;
    document.getElementById('promoteEmail').value = email;
    document.getElementById('promoteRole').value = 'viewer'; // Default role
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('promotionModal'));
    modal.show();
}

function showAddUserModal() {
    console.log('Opening Add User modal...');
    
    // Reset the form
    document.getElementById('addUserForm').reset();
    
    // Set default permissions (Read access)
    document.getElementById('addPermRead').checked = true;
    document.getElementById('addPermWrite').checked = false;
    document.getElementById('addPermDelete').checked = false;
    document.getElementById('addPermAll').checked = false;
    
    // Set up permission checkbox logic
    setupAddUserPermissionLogic();
    
    // Show the modal
    const modalElement = document.getElementById('addUserModal');
    console.log('Modal element:', modalElement);
    
    const modal = new bootstrap.Modal(modalElement);
    console.log('Bootstrap modal instance:', modal);
    modal.show();
}

function setupAddUserPermissionLogic() {
    // Handle "All Permissions" checkbox
    document.getElementById('addPermAll').addEventListener('change', function() {
        if (this.checked) {
            // Uncheck all other permissions
            document.getElementById('addPermRead').checked = false;
            document.getElementById('addPermWrite').checked = false;
            document.getElementById('addPermDelete').checked = false;
        }
    });
    
    // Handle other permission checkboxes
    ['addPermRead', 'addPermWrite', 'addPermDelete'].forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            if (this.checked) {
                // Uncheck "All Permissions" if any specific permission is selected
                document.getElementById('addPermAll').checked = false;
            }
        });
    });
}

async function handleAddUser(event) {
    console.log('handleAddUser called');
    event.preventDefault();
    
    const userData = {
        username: document.getElementById('addUsername').value,
        email: document.getElementById('addEmail').value,
        role: document.getElementById('addRole').value,
        permissions: collectAddUserPermissions()
    };
    
    console.log('Sending user data:', userData);
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create user');
        }
        
        const result = await response.json();
        console.log('User creation response:', result);
        
        // Show success message
        showAlert('success', `User ${userData.username} created successfully! Default password: changeme123`);
        
        // Close modal - use multiple methods to ensure it closes
        const modalElement = document.getElementById('addUserModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        
        console.log('Modal element:', modalElement);
        console.log('Modal instance:', modalInstance);
        
        if (modalInstance) {
            console.log('Using Bootstrap modal instance to hide');
            modalInstance.hide();
        } else {
            console.log('Using fallback method to hide modal');
            // Fallback: manually hide the modal
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        }
        
        // Reset form
        console.log('Resetting form...');
        event.target.reset();
        
        // Also manually reset the permission checkboxes to default state
        document.getElementById('addPermRead').checked = true;
        document.getElementById('addPermWrite').checked = false;
        document.getElementById('addPermDelete').checked = false;
        document.getElementById('addPermAll').checked = false;
        
        // Reload users
        console.log('Reloading users...');
        loadExistingUsers();
        
    } catch (error) {
        console.error('Error creating user:', error);
        showAlert('danger', `Failed to create user: ${error.message}`);
    }
}

function collectAddUserPermissions() {
    const permissions = [];
    
    // Check if "All Permissions" is selected
    if (document.getElementById('addPermAll').checked) {
        console.log('All permissions selected');
        return JSON.stringify(['*']);
    }
    
    // Collect individual permissions
    if (document.getElementById('addPermRead').checked) permissions.push('read');
    if (document.getElementById('addPermWrite').checked) permissions.push('write');
    if (document.getElementById('addPermDelete').checked) permissions.push('delete');
    
    console.log('Collected permissions:', permissions);
    return JSON.stringify(permissions);
}

async function handleUserEdit(event) {
    event.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    
    // Prevent admin account permission modification
    let userData;
    if (userId === '1') { // Admin user ID is 1
        userData = {
            username: document.getElementById('editUsername').value,
            email: document.getElementById('editEmail').value,
            role: document.getElementById('editRole').value,
            is_active: document.getElementById('editStatus').value === 'true',
            permissions: '["*"]' // Force admin permissions to remain unchanged
        };
    } else {
        userData = {
            username: document.getElementById('editUsername').value,
            email: document.getElementById('editEmail').value,
            role: document.getElementById('editRole').value,
            is_active: document.getElementById('editStatus').value === 'true',
            permissions: collectPermissionsFromCheckboxes()
        };
    }
    

    
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update user');
        }
        
        const result = await response.json();
        
        // Show success message
        showAlert('success', `User ${userData.username} updated successfully!`);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        modal.hide();
        
        // Reload users
        loadExistingUsers();
        
    } catch (error) {
        console.error('Error updating user:', error);
        showAlert('danger', `Failed to update user: ${error.message}`);
    }
}

async function editUser(userId) {
    console.log('editUser called with userId:', userId);
    try {
        // Get current users to find the one we're editing
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const users = await response.json();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Populate the edit form
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editRole').value = user.role;
        document.getElementById('editStatus').value = user.is_active.toString();
        
        // Handle permissions checkboxes
        populatePermissionsCheckboxes(user.permissions || '[]');
        
        // Auto-check all permissions for admin users and disable modification
        if (user.role === 'admin') {
            document.getElementById('permAll').checked = true;
            // Uncheck individual permissions since "All" is selected
            document.getElementById('permRead').checked = false;
            document.getElementById('permWrite').checked = false;
            document.getElementById('permDelete').checked = false;
            document.getElementById('permAdmin').checked = false;
            document.getElementById('permCustom').checked = false;
            document.getElementById('customPermissionsDiv').style.display = 'none';
            
            // Disable ALL permission checkboxes for admin account
            document.getElementById('permRead').disabled = true;
            document.getElementById('permWrite').disabled = true;
            document.getElementById('permDelete').disabled = true;
            document.getElementById('permAdmin').disabled = true;
            document.getElementById('permAll').disabled = true;
            document.getElementById('permCustom').disabled = true;
            document.getElementById('editPermissions').disabled = true;
            
            // Add visual indication that permissions are locked
            const permissionsSection = document.querySelector('#editUserModal .mb-3:last-child');
            if (permissionsSection) {
                let lockNotice = permissionsSection.querySelector('.admin-lock-notice');
                if (!lockNotice) {
                    lockNotice = document.createElement('div');
                    lockNotice.className = 'alert alert-warning admin-lock-notice mt-2';
                    lockNotice.innerHTML = `
                        <strong>🔒 Admin Account Protected:</strong> 
                        Admin account permissions cannot be modified to ensure system access.
                    `;
                    permissionsSection.appendChild(lockNotice);
                }
            }
        } else {
            // Enable all permission checkboxes for non-admin users
            document.getElementById('permRead').disabled = false;
            document.getElementById('permWrite').disabled = false;
            document.getElementById('permDelete').disabled = false;
            document.getElementById('permAdmin').disabled = false;
            document.getElementById('permAll').disabled = false;
            document.getElementById('permCustom').disabled = false;
            document.getElementById('editPermissions').disabled = false;
            
            // Remove admin lock notice if it exists
            const lockNotice = document.querySelector('.admin-lock-notice');
            if (lockNotice) {
                lockNotice.remove();
            }
        }
        
        // Show current permissions in a readable format
        displayCurrentPermissions(user.permissions || '[]');
        
        // Show the modal
        const modalElement = document.getElementById('editUserModal');
        console.log('Modal element found:', modalElement);
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } else {
            console.error('Edit user modal not found!');
        }
        
    } catch (error) {
        console.error('Error loading user for edit:', error);
        showAlert('danger', `Failed to load user: ${error.message}`);
    }
}

function displayCurrentPermissions(permissionsJson) {
    try {
        const permissions = JSON.parse(permissionsJson);
        let displayText = '';
        
        if (permissions.includes('*')) {
            displayText = 'All Permissions';
        } else if (permissions.length === 0) {
            displayText = 'No Permissions';
        } else {
            displayText = permissions.join(', ');
        }
        
        // Add a small info text above the permissions section
        const permissionsSection = document.querySelector('#editUserModal .mb-3:last-child');
        if (permissionsSection) {
            let infoText = permissionsSection.querySelector('.permissions-info');
            if (!infoText) {
                infoText = document.createElement('small');
                infoText.className = 'text-muted permissions-info d-block mb-2';
                permissionsSection.insertBefore(infoText, permissionsSection.firstChild);
            }
            infoText.textContent = `Current permissions: ${displayText}`;
        }
        
    } catch (error) {
        console.error('Error displaying permissions:', error);
    }
}

function collectPermissionsFromCheckboxes() {
    const permissions = [];
    
    // Check if "All Permissions" is selected
    if (document.getElementById('permAll').checked) {
        return JSON.stringify(['*']);
    }
    
    // Collect individual permissions
    if (document.getElementById('permRead').checked) permissions.push('read');
    if (document.getElementById('permWrite').checked) permissions.push('write');
    if (document.getElementById('permDelete').checked) permissions.push('delete');
    if (document.getElementById('permAdmin').checked) permissions.push('admin');
    
    // Check for custom permissions
    if (document.getElementById('permCustom').checked) {
        const customPerms = document.getElementById('editPermissions').value.trim();
        if (customPerms) {
            try {
                const customArray = JSON.parse(customPerms);
                if (Array.isArray(customArray)) {
                    permissions.push(...customArray);
                }
            } catch (error) {
                console.error('Error parsing custom permissions:', error);
                // If parsing fails, add as a single string
                permissions.push(customPerms);
            }
        }
    }
    
    return JSON.stringify(permissions);
}

function populatePermissionsCheckboxes(permissionsJson) {
    try {
        // Parse permissions JSON
        const permissions = JSON.parse(permissionsJson);
        
        // Reset all checkboxes
        document.getElementById('permRead').checked = false;
        document.getElementById('permWrite').checked = false;
        document.getElementById('permDelete').checked = false;
        document.getElementById('permAdmin').checked = false;
        document.getElementById('permAll').checked = false;
        document.getElementById('permCustom').checked = false;
        
        // Check appropriate checkboxes based on permissions
        if (permissions.includes('*')) {
            document.getElementById('permAll').checked = true;
        } else {
            if (permissions.includes('read')) document.getElementById('permRead').checked = true;
            if (permissions.includes('write')) document.getElementById('permWrite').checked = true;
            if (permissions.includes('delete')) document.getElementById('permDelete').checked = true;
            if (permissions.includes('admin')) document.getElementById('permAdmin').checked = true;
            
            // Check if there are custom permissions (not in our standard list)
            const standardPerms = ['read', 'write', 'delete', 'admin'];
            const customPerms = permissions.filter(p => !standardPerms.includes(p));
            if (customPerms.length > 0) {
                document.getElementById('permCustom').checked = true;
                document.getElementById('editPermissions').value = JSON.stringify(customPerms);
                document.getElementById('customPermissionsDiv').style.display = 'block';
            }
        }
        
        // Set up event listeners for permission checkboxes
        setupPermissionCheckboxListeners();
        
        // If this is an admin user, disable all permission modifications
        const currentUser = document.getElementById('editUserId').value;
        if (currentUser === '1') { // Admin user ID is 1
            document.getElementById('permRead').disabled = true;
            document.getElementById('permWrite').disabled = true;
            document.getElementById('permDelete').disabled = true;
            document.getElementById('permAdmin').disabled = true;
            document.getElementById('permAll').disabled = true;
            document.getElementById('permCustom').disabled = true;
            document.getElementById('editPermissions').disabled = true;
        }
        
    } catch (error) {
        console.error('Error parsing permissions:', error);
        // If parsing fails, assume no permissions
        document.getElementById('permAll').checked = false;
        document.getElementById('permRead').checked = false;
        document.getElementById('permWrite').checked = false;
        document.getElementById('permDelete').checked = false;
        document.getElementById('permAdmin').checked = false;
        document.getElementById('permCustom').checked = false;
    }
}

function setupPermissionCheckboxListeners() {
            // Handle "All Permissions" checkbox
        document.getElementById('permAll').addEventListener('change', function() {
            if (this.checked) {
                // Uncheck all other permissions
                document.getElementById('permRead').checked = false;
                document.getElementById('permWrite').checked = false;
                document.getElementById('permDelete').checked = false;
                document.getElementById('permAdmin').checked = false;
                document.getElementById('permCustom').checked = false;
                document.getElementById('customPermissionsDiv').style.display = 'none';
            }
        });
        
        // Prevent admin users from losing "All Permissions"
        const editRoleSelect = document.getElementById('editRole');
        if (editRoleSelect) {
            editRoleSelect.addEventListener('change', function() {
                if (this.value === 'admin') {
                    document.getElementById('permAll').checked = true;
                    document.getElementById('permRead').checked = false;
                    document.getElementById('permWrite').checked = false;
                    document.getElementById('permDelete').checked = false;
                    document.getElementById('permAdmin').checked = false;
                    document.getElementById('permCustom').checked = false;
                    document.getElementById('customPermissionsDiv').style.display = 'none';
                }
            });
        }
    
    // Handle other permission checkboxes
    ['permRead', 'permWrite', 'permDelete', 'permAdmin'].forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            if (this.checked) {
                // Uncheck "All Permissions" if any specific permission is selected
                document.getElementById('permAll').checked = false;
            }
        });
    });
    
    // Handle custom permissions checkbox
    document.getElementById('permCustom').addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('customPermissionsDiv').style.display = 'block';
        } else {
            document.getElementById('customPermissionsDiv').style.display = 'none';
            document.getElementById('editPermissions').value = '';
        }
    });
}

async function deleteUser(userId) {
    if (confirm('Are you sure you want to deactivate this user? This action can be undone by reactivating them.')) {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to deactivate user');
            }
            
            showAlert('success', 'User deactivated successfully');
            loadExistingUsers();
            
        } catch (error) {
            console.error('Error deactivating user:', error);
            showAlert('danger', `Failed to deactivate user: ${error.message}`);
        }
    }
}

async function toggleUserStatus(userId, currentStatus) {
    try {
        const newStatus = !currentStatus;
        const action = newStatus ? 'activate' : 'deactivate';
        
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_active: newStatus
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to ${action} user`);
        }
        
        showAlert('success', `User ${action}d successfully`);
        loadExistingUsers();
        
    } catch (error) {
        console.error('Error toggling user status:', error);
        showAlert('danger', `Failed to toggle user status: ${error.message}`);
    }
}
