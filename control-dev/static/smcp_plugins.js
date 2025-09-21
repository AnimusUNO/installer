// Mock data for plugins
const mockPlugins = [
    {
        id: 1,
        name: "SMCP Core",
        version: "1.0.0",
        category: "core",
        status: "active",
        lastUpdated: "2024-01-15T10:30:00Z",
        description: "Core SMCP functionality and base classes",
        repository: "https://github.com/animus/smcp-core",
        author: "Animus Team"
    },
    {
        id: 2,
        name: "Communication Hub",
        version: "2.1.3",
        category: "communication",
        status: "active",
        lastUpdated: "2024-01-14T15:45:00Z",
        description: "Handles inter-agent communication protocols",
        repository: "https://github.com/animus/comm-hub",
        author: "Animus Team"
    },
    {
        id: 3,
        name: "Data Processor",
        version: "1.5.2",
        category: "data",
        status: "inactive",
        lastUpdated: "2024-01-10T09:20:00Z",
        description: "Advanced data processing and transformation",
        repository: "https://github.com/animus/data-proc",
        author: "Data Team"
    },
    {
        id: 4,
        name: "Utility Toolkit",
        version: "0.9.1",
        category: "utility",
        status: "error",
        lastUpdated: "2024-01-12T14:15:00Z",
        description: "Common utility functions and helpers",
        repository: "https://github.com/animus/utility-toolkit",
        author: "Utility Team"
    },
    {
        id: 5,
        name: "Security Module",
        version: "1.2.0",
        category: "core",
        status: "active",
        lastUpdated: "2024-01-13T11:00:00Z",
        description: "Security and authentication services",
        repository: "https://github.com/animus/security-module",
        author: "Security Team"
    }
];

let currentPlugins = [...mockPlugins];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializePluginsPage();
});

function initializePluginsPage() {
    updateStats();
    populatePluginsTable();
    setupEventListeners();
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('pluginSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterPlugins);
    }

    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterPlugins);
    }

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterPlugins);
    }
}

function updateStats() {
    const total = currentPlugins.length;
    const active = currentPlugins.filter(p => p.status === 'active').length;
    const inactive = currentPlugins.filter(p => p.status === 'inactive').length;
    const error = currentPlugins.filter(p => p.status === 'error').length;

    document.getElementById('totalPlugins').textContent = total;
    document.getElementById('activePlugins').textContent = active;
    document.getElementById('inactivePlugins').textContent = inactive;
    document.getElementById('errorPlugins').textContent = error;
}

function populatePluginsTable() {
    const tbody = document.getElementById('pluginsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    currentPlugins.forEach(plugin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <span class="status-indicator status-${plugin.status}"></span>
                    <strong>${plugin.name}</strong>
                </div>
            </td>
            <td><span class="badge bg-secondary">${plugin.version}</span></td>
            <td><span class="category-${plugin.category}">${plugin.category}</span></td>
            <td>
                <span class="badge bg-${getStatusBadgeColor(plugin.status)}">
                    ${plugin.status.charAt(0).toUpperCase() + plugin.status.slice(1)}
                </span>
            </td>
            <td>${formatTimeAgo(plugin.lastUpdated)}</td>
            <td>
                <button class="btn btn-sm btn-outline-info action-btn" onclick="viewPluginDetails(${plugin.id})">
                    👁️ View
                </button>
                <button class="btn btn-sm btn-outline-warning action-btn" onclick="editPlugin(${plugin.id})">
                    ✏️ Edit
                </button>
                <button class="btn btn-sm btn-outline-danger action-btn" onclick="deletePlugin(${plugin.id})">
                    🗑️ Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterPlugins() {
    const searchTerm = document.getElementById('pluginSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';

    currentPlugins = mockPlugins.filter(plugin => {
        const matchesSearch = plugin.name.toLowerCase().includes(searchTerm) ||
                            plugin.description.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || plugin.status === statusFilter;
        const matchesCategory = !categoryFilter || plugin.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    updateStats();
    populatePluginsTable();
}

function getStatusBadgeColor(status) {
    switch (status) {
        case 'active': return 'success';
        case 'inactive': return 'warning';
        case 'error': return 'danger';
        default: return 'secondary';
    }
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
}

function addNewPlugin() {
    const modal = new bootstrap.Modal(document.getElementById('addPluginModal'));
    modal.show();
}

function savePlugin() {
    // In a real implementation, this would save to the backend
    showNotification('Plugin added successfully!', 'success');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addPluginModal'));
    modal.hide();
    
    // Refresh the plugins list
    refreshPlugins();
}

function viewPluginDetails(pluginId) {
    const plugin = mockPlugins.find(p => p.id === pluginId);
    if (!plugin) return;

    const modal = new bootstrap.Modal(document.getElementById('pluginDetailsModal'));
    const content = document.getElementById('pluginDetailsContent');
    
    content.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Basic Information</h6>
                <div class="list-group list-group-flush bg-transparent">
                    <div class="list-group-item bg-transparent border-secondary d-flex justify-content-between">
                        <span>Name</span>
                        <span class="text-light">${plugin.name}</span>
                    </div>
                    <div class="list-group-item bg-transparent border-secondary d-flex justify-content-between">
                        <span>Version</span>
                        <span class="text-light">${plugin.version}</span>
                    </div>
                    <div class="list-group-item bg-transparent border-secondary d-flex justify-content-between">
                        <span>Category</span>
                        <span class="text-light category-${plugin.category}">${plugin.category}</span>
                    </div>
                    <div class="list-group-item bg-transparent border-secondary d-flex justify-content-between">
                        <span>Status</span>
                        <span class="badge bg-${getStatusBadgeColor(plugin.status)}">${plugin.status}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <h6>Details</h6>
                <div class="list-group list-group-flush bg-transparent">
                    <div class="list-group-item bg-transparent border-secondary d-flex justify-content-between">
                        <span>Author</span>
                        <span class="text-light">${plugin.author}</span>
                    </div>
                    <div class="list-group-item bg-transparent border-secondary d-flex justify-content-between">
                        <span>Last Updated</span>
                        <span class="text-light">${new Date(plugin.lastUpdated).toLocaleString()}</span>
                    </div>
                    <div class="list-group-item bg-transparent border-secondary d-flex justify-content-between">
                        <span>Repository</span>
                        <a href="${plugin.repository}" target="_blank" class="text-info">View</a>
                    </div>
                </div>
            </div>
        </div>
        <hr class="my-3">
        <div class="row">
            <div class="col-12">
                <h6>Description</h6>
                <p class="text-light">${plugin.description}</p>
            </div>
        </div>
    `;
    
    modal.show();
}

function editPlugin(pluginId) {
    // In a real implementation, this would open an edit form
    showNotification('Edit functionality coming soon!', 'info');
}

function deletePlugin(pluginId) {
    if (confirm('Are you sure you want to delete this plugin? This action cannot be undone.')) {
        // In a real implementation, this would delete from the backend
        mockPlugins.splice(mockPlugins.findIndex(p => p.id === pluginId), 1);
        currentPlugins = [...mockPlugins];
        updateStats();
        populatePluginsTable();
        showNotification('Plugin deleted successfully!', 'success');
    }
}

function refreshPlugins() {
    // Simulate loading
    const refreshBtn = document.querySelector('button[onclick="refreshPlugins()"]');
    if (refreshBtn) {
        refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Refreshing...';
        refreshBtn.disabled = true;
    }

    // Simulate API call delay
    setTimeout(() => {
        // Reset to original data
        currentPlugins = [...mockPlugins];
        updateStats();
        populatePluginsTable();
        
        if (refreshBtn) {
            refreshBtn.innerHTML = '🔄 Refresh';
            refreshBtn.disabled = false;
        }
        
        showNotification('Plugins refreshed successfully!', 'success');
    }, 1000);
}

function exportPlugins() {
    const dataStr = JSON.stringify(currentPlugins, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `smcp-plugins-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Plugins exported successfully!', 'success');
}

function showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
            notification.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px; max-width: 400px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
