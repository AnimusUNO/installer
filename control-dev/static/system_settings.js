// System Settings JavaScript

// Mock data for demonstration
let discoveredUsers = [];
let existingUsers = [
    { id: 1, username: 'admin', email: 'admin@animus.local', role: 'admin', status: 'Active', lastLogin: '2024-01-15 10:30' },
    { id: 2, username: 'john_doe', email: 'john@example.com', role: 'user', status: 'Active', lastLogin: '2024-01-14 15:45' },
    { id: 3, username: 'jane_smith', email: 'jane@example.com', role: 'viewer', status: 'Inactive', lastLogin: '2024-01-10 09:20' }
];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('System Settings page loaded');
    loadExistingUsers();
    setupEventListeners();
    console.log('Event listeners set up');
});

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Discover users button
    const discoverBtn = document.getElementById('discoverUsers');
    if (discoverBtn) {
        console.log('Found discover button, adding listener');
        discoverBtn.addEventListener('click', discoverUsers);
    } else {
        console.error('Discover button not found!');
    }
    
    // User search and filter
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
    }
    
    const roleFilter = document.getElementById('roleFilter');
    if (roleFilter) {
        roleFilter.addEventListener('change', filterUsers);
    }
    
    // Configuration actions
    const saveBtn = document.getElementById('saveConfig');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveConfiguration);
    }
    
    const exportBtn = document.getElementById('exportConfig');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportConfiguration);
    }
    
    const importBtn = document.getElementById('importConfig');
    if (importBtn) {
        importBtn.addEventListener('click', importConfiguration);
    }
    
    // Modal close
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Edit user form submission
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', handleEditUserSubmit);
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('promotionModal')) {
            closeModal();
        }
        if (event.target === document.getElementById('editUserModal')) {
            closeEditModal();
        }
    });
    
    console.log('Event listeners setup complete');
}

// User Discovery Functions
function discoverUsers() {
    console.log('Discover users clicked');
    const button = document.getElementById('discoverUsers');
    const originalText = button.innerHTML;
    
    button.innerHTML = '🔍 Discovering...';
    button.disabled = true;
    
    // Simulate API call to Broca
    setTimeout(() => {
        // Mock discovered users from Broca
        discoveredUsers = [
            { username: 'alice_chat', email: 'alice@example.com', interactions: 15, lastSeen: '2024-01-15' },
            { username: 'bob_user', email: 'bob@example.com', interactions: 8, lastSeen: '2024-01-14' },
            { username: 'charlie_agent', email: 'charlie@example.com', interactions: 23, lastSeen: '2024-01-15' }
        ];
        
        displayDiscoveredUsers();
        button.innerHTML = originalText;
        button.disabled = false;
    }, 2000);
}

function displayDiscoveredUsers() {
    const container = document.getElementById('discoveredUsers');
    const grid = document.getElementById('userGrid');
    
    grid.innerHTML = '';
    
    discoveredUsers.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
            <h4>${user.username}</h4>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Interactions:</strong> ${user.interactions}</p>
            <p><strong>Last Seen:</strong> ${user.lastSeen}</p>
            <button class="btn btn-primary" onclick="promoteUser('${user.username}', '${user.email}')">
                🚀 Promote to User
            </button>
        `;
        grid.appendChild(userCard);
    });
    
    container.style.display = 'block';
}

function promoteUser(username, email) {
    document.getElementById('promoteUsername').value = username;
    document.getElementById('promoteEmail').value = email;
    document.getElementById('promotionModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('promotionModal').style.display = 'none';
    document.getElementById('promotionForm').reset();
}

// User Management Functions
function loadExistingUsers() {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';
    
    existingUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role}">${user.role}</span></td>
            <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></td>
            <td>${user.lastLogin}</td>
            <td>
                <button class="btn btn-small" onclick="editUser(${user.id})">✏️ Edit</button>
                <button class="btn btn-small" onclick="toggleUserStatus(${user.id})">
                    ${user.status === 'Active' ? '⏸️ Deactivate' : '▶️ Activate'}
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    
    const filteredUsers = existingUsers.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm) || 
                            user.email.toLowerCase().includes(searchTerm);
        const matchesRole = !roleFilter || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });
    
    displayFilteredUsers(filteredUsers);
}

function displayFilteredUsers(users) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role}">${user.role}</span></td>
            <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</td>
            <td>${user.lastLogin}</td>
            <td>
                <button class="btn btn-small" onclick="editUser(${user.id})">✏️ Edit</button>
                <button class="btn btn-small" onclick="toggleUserStatus(${user.id})">
                    ${user.status === 'Active' ? '⏸️ Deactivate' : '▶️ Activate'}
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editUser(userId) {
    const user = existingUsers.find(u => u.id === userId);
    if (user) {
        // Populate the edit modal with user data
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editRole').value = user.role;
        document.getElementById('editStatus').value = user.status;
        document.getElementById('editPassword').value = '';
        
        // Show the edit modal
        document.getElementById('editUserModal').style.display = 'flex';
    }
}

function closeEditModal() {
    document.getElementById('editUserModal').style.display = 'none';
    document.getElementById('editUserForm').reset();
}

function toggleEditPassword() {
    const input = document.getElementById('editPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
}

function deleteUser() {
    const userId = parseInt(document.getElementById('editUserId').value);
    const user = existingUsers.find(u => u.id === userId);
    
    if (user && confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
        // Remove user from the array
        existingUsers = existingUsers.filter(u => u.id !== userId);
        
        // Refresh the user table
        loadExistingUsers();
        
        // Close the modal
        closeEditModal();
        
        // Show success notification
        showNotification(`User "${user.username}" deleted successfully!`, 'success');
    }
}

function toggleUserStatus(userId) {
    const user = existingUsers.find(u => u.id === userId);
    if (user) {
        user.status = user.status === 'Active' ? 'Inactive' : 'Active';
        loadExistingUsers();
    }
}

// Configuration Functions
function saveConfiguration() {
    const config = {
        openaiKey: document.getElementById('openaiKey').value,
        anthropicKey: document.getElementById('anthropicKey').value,
        ollamaUrl: document.getElementById('ollamaUrl').value,
        animusPath: document.getElementById('animusPath').value,
        lettaPath: document.getElementById('lettaPath').value
    };
    
    // In a real app, this would send to the backend
    console.log('Saving configuration:', config);
    
    // Show success message
    showNotification('Configuration saved successfully!', 'success');
}

function exportConfiguration() {
    const config = {
        openaiKey: document.getElementById('openaiKey').value,
        anthropicKey: document.getElementById('anthropicKey').value,
        ollamaUrl: document.getElementById('ollamaUrl').value,
        animusPath: document.getElementById('animusPath').value,
        lettaPath: document.getElementById('lettaPath').value
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'animus-config.json';
    link.click();
    
    showNotification('Configuration exported successfully!', 'success');
}

function importConfiguration() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const config = JSON.parse(e.target.result);
                
                // Populate form fields
                document.getElementById('openaiKey').value = config.openaiKey || '';
                document.getElementById('anthropicKey').value = config.anthropicKey || '';
                document.getElementById('ollamaUrl').value = config.ollamaUrl || '';
                document.getElementById('animusPath').value = config.animusPath || '';
                document.getElementById('lettaPath').value = config.lettaPath || '';
                
                showNotification('Configuration imported successfully!', 'success');
            } catch (error) {
                showNotification('Error importing configuration file', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Utility Functions
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Handle form submission
document.getElementById('promotionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('promoteUsername').value;
    const email = document.getElementById('promoteEmail').value;
    const role = document.getElementById('promoteRole').value;
    
    // In a real app, this would send to the backend
    console.log('Promoting user:', { username, email, role });
    
    // Add to existing users
    const newUser = {
        id: existingUsers.length + 1,
        username,
        email,
        role,
        status: 'Active',
        lastLogin: 'Never'
    };
    
    existingUsers.push(newUser);
    loadExistingUsers();
    
    // Remove from discovered users
    discoveredUsers = discoveredUsers.filter(u => u.username !== username);
    displayDiscoveredUsers();
    
    closeModal();
    showNotification(`User ${username} promoted successfully!`, 'success');
});

// Handle edit user form submission
function handleEditUserSubmit(e) {
    e.preventDefault();
    
    const userId = parseInt(document.getElementById('editUserId').value);
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const role = document.getElementById('editRole').value;
    const status = document.getElementById('editStatus').value;
    const password = document.getElementById('editPassword').value;
    
    // Find and update the user
    const userIndex = existingUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        // Update user data
        existingUsers[userIndex] = {
            ...existingUsers[userIndex],
            username,
            email,
            role,
            status
        };
        
        // In a real app, this would send to the backend
        console.log('Updating user:', { userId, username, email, role, status, passwordChanged: !!password });
        
        // Refresh the user table
        loadExistingUsers();
        
        // Close the modal
        closeEditModal();
        
        // Show success notification
        showNotification(`User "${username}" updated successfully!`, 'success');
    }
}

