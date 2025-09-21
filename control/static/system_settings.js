/**
 * Sanctum Control Interface - System Settings JavaScript
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

// System Settings JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('System Settings page loaded');
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load current configuration
    loadCurrentConfig();
});

function initializeEventListeners() {
    // Save Configuration button
    const saveConfigBtn = document.getElementById('saveConfig');
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', saveSystemConfig);
    }
    
    // Save Letta Config button
    const saveLettaBtn = document.getElementById('saveLettaConfig');
    if (saveLettaBtn) {
        saveLettaBtn.addEventListener('click', saveLettaConfig);
    }
    
    // Test Connection button
    const testConnectionBtn = document.getElementById('testConnection');
    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', testConnection);
    }
    

    
    // Export Config button
    const exportBtn = document.getElementById('exportConfig');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportConfig);
    }
    
    // Import Config button
    const importBtn = document.getElementById('importConfig');
    if (importBtn) {
        importBtn.addEventListener('click', importConfig);
    }
}

function loadCurrentConfig() {
    console.log('Loading current configuration...');
    // Configuration is loaded server-side via Jinja2 template
    // This function can be used for future dynamic loading if needed
}

function saveSystemConfig() {
    console.log('Saving system configuration...');
    
    const config = {
        openai_api_key: document.getElementById('openaiKey').value,
        anthropic_api_key: document.getElementById('anthropicKey').value,
        ollama_base_url: document.getElementById('ollamaUrl').value,
        animus_base_path: document.getElementById('animusPath').value,
        letta_data_path: document.getElementById('lettaPath').value,
        flask_port: parseInt(document.getElementById('flaskPort').value),
        smcp_port: parseInt(document.getElementById('smcpPort').value)
    };
    
    // Call API to save system configuration
    fetch('/api/system-config', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(`Error saving configuration: ${data.error}`, 'danger');
        } else {
            showMessage('System configuration saved successfully!', 'success');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error saving configuration. Please try again.', 'danger');
    });
}

function saveLettaConfig() {
    console.log('Saving Letta configuration...');
    
    const config = {
        letta_server_address: document.getElementById('lettaServerAddress').value,
        letta_server_port: parseInt(document.getElementById('lettaServerPort').value),
        letta_server_token: document.getElementById('lettaServerToken').value,
        letta_connection_timeout: parseInt(document.getElementById('lettaTimeout').value),
        letta_server_active: document.getElementById('lettaServerActive').checked
    };
    
    // Call API to save Letta configuration
    fetch('/api/system-config', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(`Error saving Letta configuration: ${data.error}`, 'danger');
        } else {
            showMessage('Letta configuration saved successfully!', 'success');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error saving Letta configuration. Please try again.', 'danger');
    });
}

function testConnection() {
    console.log('Testing connection...');
    
    // Get current configuration values
    const serverAddress = document.getElementById('lettaServerAddress').value;
    const serverPort = document.getElementById('lettaServerPort').value;
    const serverToken = document.getElementById('lettaServerToken').value;
    
    if (!serverAddress || !serverPort) {
        showMessage('Please configure server address and port first', 'warning');
        return;
    }
    
    // Validate port number
    const portNum = parseInt(serverPort);
    if (portNum < 1 || portNum > 65535) {
        showMessage('Invalid port number. Port must be between 1 and 65535', 'warning');
        return;
    }
    
    // Clear previous response status
    clearResponseStatus();
    
    // Update status badge
    const statusBadge = document.querySelector('#testConnection').previousElementSibling;
    if (statusBadge) {
        statusBadge.textContent = 'Testing...';
        statusBadge.className = 'badge bg-warning me-2';
    }
    
    // Update response details with test info
    updateResponseStatus('httpStatus', 'Testing...');
    updateResponseStatus('responseTime', 'Measuring...');
    updateResponseStatus('responseDetails', `Testing Letta API connection to: ${serverAddress}:${serverPort}/v1/health/`);
    updateResponseStatus('lastTestTime', new Date().toLocaleString());
    
    // Use backend proxy to avoid CORS issues
    fetch('/api/test-letta-connection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            server_address: serverAddress,
            server_port: serverPort,
            server_token: serverToken
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Backend response:', data); // Debug logging
        if (data.success) {
            // Connection successful
            if (statusBadge) {
                statusBadge.textContent = 'Connected';
                statusBadge.className = 'badge bg-success me-2';
            }
            
            updateResponseStatus('httpStatus', `${data.http_status} OK`);
            updateResponseStatus('responseTime', `${data.response_time}ms`);
            updateResponseStatus('responseDetails', `✅ ${data.message}`);
            
            showMessage('Connection test successful! Letta server is responding.', 'success');
        } else {
            // Connection failed
            if (statusBadge) {
                statusBadge.textContent = 'Failed';
                statusBadge.className = 'badge bg-danger me-2';
            }
            
            updateResponseStatus('httpStatus', data.http_status || 'Failed');
            updateResponseStatus('responseTime', data.response_time ? `${data.response_time}ms` : '-');
            updateResponseStatus('responseDetails', `❌ ${data.message || data.error || 'Unknown error'}`);
            
            showMessage('Connection test failed. Check server configuration.', 'danger');
        }
    })
    .catch(error => {
        console.error('Connection test error:', error);
        
        if (statusBadge) {
            statusBadge.textContent = 'Error';
            statusBadge.className = 'badge bg-danger me-2';
        }
        
        updateResponseStatus('httpStatus', 'Error');
        updateResponseStatus('responseTime', '-');
        updateResponseStatus('responseDetails', `❌ Network error: ${error.message}`);
        
        showMessage('Connection test failed due to network error.', 'danger');
    });
}

function exportConfig() {
    console.log('Exporting configuration...');
    
    // TODO: Implement configuration export
    showMessage('Configuration export feature coming soon!', 'info');
}

function importConfig() {
    console.log('Importing configuration...');
    
    // TODO: Implement configuration import
    showMessage('Configuration import feature coming soon!', 'info');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

function showMessage(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at top of main content
    const main = document.querySelector('main');
    if (main) {
        main.insertBefore(alertDiv, main.firstChild);
        
        // Auto-remove after 5 seconds
    setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Helper functions for response status area
function updateResponseStatus(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function clearResponseStatus() {
    updateResponseStatus('httpStatus', '-');
    updateResponseStatus('responseTime', '-');
    updateResponseStatus('responseDetails', 'No test performed yet');
    updateResponseStatus('lastTestTime', '-');
}




