// Create Agent Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCreateAgent();
});

// Agent templates for quick setup
const agentTemplates = {
    assistant: {
        name: 'Assistant',
        displayName: 'General Assistant',
        description: 'A helpful AI assistant for general tasks and questions',
        primaryModel: 'gpt-4',
        fallbackModel: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: '2048',
        systemInstructions: 'You are a helpful AI assistant. You provide clear, accurate, and helpful responses to user questions. You are polite, professional, and always try to be as helpful as possible.',
        additionalContext: 'Focus on being helpful and informative. If you don\'t know something, say so rather than making things up.',
        enableBroca: true,
        enableFileManager: false,
        enableNetworkTools: false,
        enableDevOps: false,
        accessLevel: 'standard',
        enableApiAccess: false,
        enableWebhook: false,
        deploymentStrategy: 'immediate',
        resourceAllocation: 'standard'
    },
    developer: {
        name: 'Developer',
        displayName: 'Developer Helper',
        description: 'Specialized AI assistant for software development tasks',
        primaryModel: 'gpt-4',
        fallbackModel: 'gpt-3.5-turbo',
        temperature: 0.3,
        maxTokens: '4096',
        systemInstructions: 'You are a specialized AI assistant for software development. You help with coding, debugging, architecture decisions, and development best practices. You provide code examples, explain concepts clearly, and suggest improvements.',
        additionalContext: 'Always provide practical, production-ready code examples. Explain your reasoning and suggest alternatives when appropriate.',
        enableBroca: true,
        enableFileManager: true,
        enableNetworkTools: true,
        enableDevOps: true,
        accessLevel: 'elevated',
        enableApiAccess: true,
        enableWebhook: false,
        deploymentStrategy: 'immediate',
        resourceAllocation: 'enhanced'
    },
    analyst: {
        name: 'Analyst',
        displayName: 'Data Analyst',
        description: 'AI assistant specialized in data analysis and insights',
        primaryModel: 'gpt-4',
        fallbackModel: 'gpt-3.5-turbo',
        temperature: 0.5,
        maxTokens: '8192',
        systemInstructions: 'You are a data analysis specialist. You help users understand data, create visualizations, perform statistical analysis, and derive meaningful insights. You are precise, analytical, and explain complex concepts clearly.',
        additionalContext: 'Focus on data-driven insights and practical analysis techniques. Suggest appropriate tools and methodologies.',
        enableBroca: true,
        enableFileManager: true,
        enableNetworkTools: false,
        enableDevOps: false,
        accessLevel: 'standard',
        enableApiAccess: false,
        enableWebhook: false,
        deploymentStrategy: 'immediate',
        resourceAllocation: 'standard'
    },
    creative: {
        name: 'Creative',
        displayName: 'Creative Writer',
        description: 'AI assistant for creative writing and content generation',
        primaryModel: 'gpt-4',
        fallbackModel: 'gpt-3.5-turbo',
        temperature: 1.2,
        maxTokens: '4096',
        systemInstructions: 'You are a creative writing assistant. You help users develop stories, create engaging content, brainstorm ideas, and improve writing skills. You are imaginative, inspiring, and help unlock creativity.',
        additionalContext: 'Encourage creative thinking and provide constructive feedback. Help users develop their unique voice and style.',
        enableBroca: true,
        enableFileManager: true,
        enableNetworkTools: false,
        enableDevOps: false,
        accessLevel: 'restricted',
        enableApiAccess: false,
        enableWebhook: false,
        deploymentStrategy: 'immediate',
        resourceAllocation: 'standard'
    },
    custom: {
        name: '',
        displayName: '',
        description: '',
        primaryModel: 'gpt-4',
        fallbackModel: '',
        temperature: 0.7,
        maxTokens: '2048',
        systemInstructions: '',
        additionalContext: '',
        enableBroca: true,
        enableFileManager: false,
        enableNetworkTools: false,
        enableDevOps: false,
        accessLevel: 'restricted',
        enableApiAccess: false,
        enableWebhook: false,
        deploymentStrategy: 'immediate',
        resourceAllocation: 'standard'
    }
};

// Initialize the page
function initializeCreateAgent() {
    setupEventListeners();
    setupFormValidation();
    updatePreview();
    updateConfigSummary();
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('createAgentForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Real-time updates for preview
    const formInputs = form.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });
    
    // Temperature range display
    const temperatureRange = document.getElementById('temperature');
    if (temperatureRange) {
        temperatureRange.addEventListener('input', function() {
            updateTemperatureDisplay(this.value);
        });
    }
    
    // Deployment strategy change
    const deploymentStrategy = document.getElementById('deploymentStrategy');
    if (deploymentStrategy) {
        deploymentStrategy.addEventListener('change', function() {
            updateDeploymentOptions(this.value);
        });
    }
}

// Setup form validation
function setupFormValidation() {
    const agentName = document.getElementById('agentName');
    if (agentName) {
        agentName.addEventListener('input', function() {
            validateAgentName(this.value);
        });
    }
    
    const systemInstructions = document.getElementById('systemInstructions');
    if (systemInstructions) {
        systemInstructions.addEventListener('input', function() {
            validateSystemInstructions(this.value);
        });
    }
}

// Validate agent name
function validateAgentName(name) {
    const input = document.getElementById('agentName');
    if (!name) {
        input.classList.remove('is-valid', 'is-invalid');
        return;
    }
    
    if (/^[a-zA-Z0-9\-_]+$/.test(name) && name.length >= 3 && name.length <= 50) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
    }
}

// Validate system instructions
function validateSystemInstructions(instructions) {
    const input = document.getElementById('systemInstructions');
    if (!instructions) {
        input.classList.remove('is-valid', 'is-invalid');
        return;
    }
    
    if (instructions.length >= 50 && instructions.length <= 2000) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
    }
}

// Update temperature display
function updateTemperatureDisplay(value) {
    const labels = document.querySelectorAll('.form-range + .d-flex small');
    if (labels.length >= 3) {
        const focused = labels[0];
        const balanced = labels[1];
        const creative = labels[2];
        
        // Reset all labels
        focused.className = 'text-muted';
        balanced.className = 'text-muted';
        creative.className = 'text-muted';
        
        // Highlight current value
        if (value <= 0.3) {
            focused.className = 'text-primary fw-bold';
        } else if (value <= 1.0) {
            balanced.className = 'text-primary fw-bold';
        } else {
            creative.className = 'text-primary fw-bold';
        }
    }
}

// Update deployment options
function updateDeploymentOptions(strategy) {
    const resourceAllocation = document.getElementById('resourceAllocation');
    const enableMonitoring = document.getElementById('enableMonitoring');
    
    if (strategy === 'scheduled') {
        // Add scheduled deployment specific options if needed
        console.log('Scheduled deployment selected');
    } else if (strategy === 'manual') {
        // Add manual deployment specific options if needed
        console.log('Manual deployment selected');
    }
}

// Update agent preview
function updatePreview() {
    const preview = document.getElementById('agentPreview');
    if (!preview) return;
    
    const formData = getFormData();
    
    if (!formData.agentName) {
        preview.innerHTML = `
            <div class="text-center text-muted py-4">
                <div class="h4 mb-2">🤖</div>
                <p class="mb-0">Fill out the form to see a preview</p>
            </div>
        `;
        return;
    }
    
    const modelInfo = getModelInfo(formData.primaryModel);
    const accessLevelInfo = getAccessLevelInfo(formData.accessLevel);
    
    preview.innerHTML = `
        <div class="text-center mb-3">
            <div class="h3 mb-2">${formData.displayName || formData.agentName}</div>
            <span class="badge bg-primary">${formData.primaryModel}</span>
            ${formData.fallbackModel ? `<span class="badge bg-secondary ms-2">${formData.fallbackModel}</span>` : ''}
        </div>
        <div class="mb-3">
            <p class="text-muted small mb-2">${formData.description || 'No description provided'}</p>
        </div>
        <div class="row text-center">
            <div class="col-6">
                <div class="h6 mb-1">Temperature</div>
                <small class="text-muted">${formData.temperature}</small>
            </div>
            <div class="col-6">
                <div class="h6 mb-1">Max Tokens</div>
                <small class="text-muted">${formData.maxTokens}</small>
            </div>
        </div>
        <hr class="my-3">
        <div class="d-flex justify-content-between align-items-center">
            <span class="badge bg-${accessLevelInfo.color}">${accessLevelInfo.label}</span>
            <span class="badge bg-info">${formData.resourceAllocation}</span>
        </div>
    `;
}

// Update configuration summary
function updateConfigSummary() {
    const summary = document.getElementById('configSummary');
    if (!summary) return;
    
    const formData = getFormData();
    
    if (!formData.agentName) {
        summary.innerHTML = `
            <div class="text-center text-muted py-3">
                <p class="mb-0">Configuration details will appear here</p>
            </div>
        `;
        return;
    }
    
    const enabledModules = [];
    if (formData.enableBroca) enabledModules.push('Broca');
    if (formData.enableFileManager) enabledModules.push('File Manager');
    if (formData.enableNetworkTools) enabledModules.push('Network Tools');
    if (formData.enableDevOps) enabledModules.push('DevOps Tools');
    
    const enabledFeatures = [];
    if (formData.enableApiAccess) enabledFeatures.push('API Access');
    if (formData.enableWebhook) enabledFeatures.push('Webhooks');
    if (formData.enableMonitoring) enabledFeatures.push('Monitoring');
    if (formData.enableLogging) enabledFeatures.push('Logging');
    if (formData.enableBackup) enabledFeatures.push('Backup');
    
    summary.innerHTML = `
        <div class="mb-3">
            <h6 class="text-primary">Modules</h6>
            <div class="d-flex flex-wrap gap-1">
                <span class="badge bg-success">Core</span>
                ${enabledModules.map(module => `<span class="badge bg-primary">${module}</span>`).join('')}
            </div>
        </div>
        <div class="mb-3">
            <h6 class="text-primary">Features</h6>
            <div class="d-flex flex-wrap gap-1">
                ${enabledFeatures.map(feature => `<span class="badge bg-info">${feature}</span>`).join('')}
            </div>
        </div>
        <div class="mb-3">
            <h6 class="text-primary">Deployment</h6>
            <div class="small text-muted">
                <div>Strategy: ${formData.deploymentStrategy}</div>
                <div>Resources: ${formData.resourceAllocation}</div>
            </div>
        </div>
    `;
}

// Get form data
function getFormData() {
    const form = document.getElementById('createAgentForm');
    const formData = new FormData(form);
    
    return {
        agentName: formData.get('agentName') || '',
        displayName: formData.get('displayName') || '',
        description: formData.get('agentDescription') || '',
        primaryModel: formData.get('primaryModel') || '',
        fallbackModel: formData.get('fallbackModel') || '',
        temperature: formData.get('temperature') || '0.7',
        maxTokens: formData.get('maxTokens') || '2048',
        systemInstructions: formData.get('systemInstructions') || '',
        additionalContext: formData.get('additionalContext') || '',
        enableBroca: formData.get('enableBroca') === 'on',
        enableFileManager: formData.get('enableFileManager') === 'on',
        enableNetworkTools: formData.get('enableNetworkTools') === 'on',
        enableDevOps: formData.get('enableDevOps') === 'on',
        accessLevel: formData.get('accessLevel') || 'restricted',
        enableApiAccess: formData.get('enableApiAccess') === 'on',
        enableWebhook: formData.get('enableWebhook') === 'on',
        allowedDomains: formData.get('allowedDomains') || '',
        deploymentStrategy: formData.get('deploymentStrategy') || 'immediate',
        resourceAllocation: formData.get('resourceAllocation') || 'standard',
        enableMonitoring: formData.get('enableMonitoring') === 'on',
        enableLogging: formData.get('enableLogging') === 'on',
        enableBackup: formData.get('enableBackup') === 'on'
    };
}

// Get model information
function getModelInfo(model) {
    const modelInfo = {
        'gpt-4': { name: 'GPT-4', description: 'Most capable model' },
        'gpt-4-turbo': { name: 'GPT-4 Turbo', description: 'Fast and efficient' },
        'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', description: 'Good balance' },
        'claude-3-opus': { name: 'Claude 3 Opus', description: 'Highly capable' },
        'claude-3-sonnet': { name: 'Claude 3 Sonnet', description: 'Balanced performance' },
        'claude-3-haiku': { name: 'Claude 3 Haiku', description: 'Fast and efficient' }
    };
    
    return modelInfo[model] || { name: model, description: 'Custom model' };
}

// Get access level information
function getAccessLevelInfo(level) {
    const accessLevels = {
        'restricted': { label: 'Restricted', color: 'warning' },
        'standard': { label: 'Standard', color: 'info' },
        'elevated': { label: 'Elevated', color: 'primary' },
        'admin': { label: 'Administrative', color: 'danger' }
    };
    
    return accessLevels[level] || accessLevels['restricted'];
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = getFormData();
    
    // Validate required fields
    if (!validateForm(formData)) {
        return;
    }
    
    console.log('Creating agent with config:', formData);
    
    // Show progress modal
    showProgressModal('Creating Agent', 'Initializing agent creation process...');
    
    // Simulate agent creation process
    simulateAgentCreation(formData);
}

// Validate form data
function validateForm(formData) {
    let isValid = true;
    
    if (!formData.agentName) {
        showNotification('Agent name is required', 'error');
        isValid = false;
    }
    
    if (!formData.primaryModel) {
        showNotification('Primary model is required', 'error');
        isValid = false;
    }
    
    if (!formData.systemInstructions) {
        showNotification('System instructions are required', 'error');
        isValid = false;
    }
    
    if (formData.agentName && !/^[a-zA-Z0-9\-_]+$/.test(formData.agentName)) {
        showNotification('Agent name can only contain letters, numbers, hyphens, and underscores', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Simulate agent creation process
function simulateAgentCreation(config) {
    const steps = [
        { message: 'Validating configuration...', progress: 10 },
        { message: 'Creating agent container...', progress: 25 },
        { message: 'Installing core modules...', progress: 40 },
        { message: 'Configuring AI model...', progress: 55 },
        { message: 'Setting up security...', progress: 70 },
        { message: 'Deploying to system...', progress: 85 },
        { message: 'Finalizing setup...', progress: 100 }
    ];
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            updateProgress(step.message, step.progress);
            currentStep++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                hideProgressModal();
                completeAgentCreation(config);
            }, 1000);
        }
    }, 1500);
}

// Complete agent creation
function completeAgentCreation(config) {
    showNotification(`Agent "${config.agentName}" created successfully!`, 'success');
    
    // Reset form
    resetForm();
    
    // Redirect to settings page after a delay
    setTimeout(() => {
        window.location.href = '/settings';
    }, 2000);
}

// Load template
function loadTemplate(templateName) {
    const template = agentTemplates[templateName];
    if (!template) return;
    
    // Populate form with template data
    Object.keys(template).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = template[key];
            } else {
                element.value = template[key];
            }
        }
    });
    
    // Update preview and summary
    updatePreview();
    updateConfigSummary();
    
    // Show notification
    showNotification(`Loaded ${template.displayName || template.name} template`, 'success');
}

// Reset form
function resetForm() {
    const form = document.getElementById('createAgentForm');
    if (form) {
        form.reset();
        
        // Reset custom elements
        const temperatureRange = document.getElementById('temperature');
        if (temperatureRange) {
            temperatureRange.value = '0.7';
            updateTemperatureDisplay('0.7');
        }
        
        // Update preview and summary
        updatePreview();
        updateConfigSummary();
        
        showNotification('Form reset successfully', 'info');
    }
}

// Save draft
function saveDraft() {
    const formData = getFormData();
    
    // Save to localStorage
    localStorage.setItem('agentDraft', JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString()
    }));
    
    showNotification('Draft saved successfully', 'success');
}

// Load draft
function loadDraft() {
    const draft = localStorage.getItem('agentDraft');
    if (!draft) {
        showNotification('No draft found', 'info');
        return;
    }
    
    try {
        const { data, timestamp } = JSON.parse(draft);
        
        // Populate form with draft data
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else {
                    element.value = data[key];
                }
            }
        });
        
        // Update preview and summary
        updatePreview();
        updateConfigSummary();
        
        showNotification(`Draft loaded (saved ${new Date(timestamp).toLocaleString()})`, 'success');
    } catch (error) {
        console.error('Error loading draft:', error);
        showNotification('Error loading draft', 'error');
    }
}

// Preview agent
function previewAgent() {
    const formData = getFormData();
    
    if (!validateForm(formData)) {
        return;
    }
    
    const previewContent = document.getElementById('previewContent');
    if (previewContent) {
        previewContent.innerHTML = generatePreviewHTML(formData);
    }
    
    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    modal.show();
}

// Generate preview HTML
function generatePreviewHTML(config) {
    return `
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary">Basic Information</h6>
                <ul class="list-unstyled">
                    <li><strong>Name:</strong> ${config.agentName}</li>
                    <li><strong>Display Name:</strong> ${config.displayName || 'Not specified'}</li>
                    <li><strong>Description:</strong> ${config.description || 'Not specified'}</li>
                </ul>
            </div>
            <div class="col-md-6">
                <h6 class="text-primary">AI Configuration</h6>
                <ul class="list-unstyled">
                    <li><strong>Primary Model:</strong> ${config.primaryModel}</li>
                    <li><strong>Fallback:</strong> ${config.fallbackModel || 'None'}</li>
                    <li><strong>Temperature:</strong> ${config.temperature}</li>
                    <li><strong>Max Tokens:</strong> ${config.maxTokens}</li>
                </ul>
            </div>
        </div>
        <hr class="my-3">
        <div class="row">
            <div class="col-12">
                <h6 class="text-primary">System Instructions</h6>
                <div class="bg-dark p-3 rounded">
                    <pre class="text-light mb-0">${config.systemInstructions}</pre>
                </div>
            </div>
        </div>
        <hr class="my-3">
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary">Modules & Features</h6>
                <ul class="list-unstyled">
                    <li><span class="badge bg-success">Core</span> (Always enabled)</li>
                    ${config.enableBroca ? '<li><span class="badge bg-primary">Broca</span> (Message Processing)</li>' : ''}
                    ${config.enableFileManager ? '<li><span class="badge bg-primary">File Manager</span></li>' : ''}
                    ${config.enableNetworkTools ? '<li><span class="badge bg-primary">Network Tools</span></li>' : ''}
                    ${config.enableDevOps ? '<li><span class="badge bg-primary">DevOps Tools</span></li>' : ''}
                </ul>
            </div>
            <div class="col-md-6">
                <h6 class="text-primary">Deployment</h6>
                <ul class="list-unstyled">
                    <li><strong>Strategy:</strong> ${config.deploymentStrategy}</li>
                    <li><strong>Resources:</strong> ${config.resourceAllocation}</li>
                    <li><strong>Access Level:</strong> ${getAccessLevelInfo(config.accessLevel).label}</li>
                </ul>
            </div>
        </div>
    `;
}

// Create agent from preview
function createAgentFromPreview() {
    hidePreviewModal();
    handleFormSubmit(new Event('submit'));
}

// Show progress modal
function showProgressModal(title, message) {
    document.getElementById('progressModalTitle').textContent = title;
    document.getElementById('progressMessage').textContent = message;
    document.getElementById('progressBar').style.width = '0%';
    
    const modal = new bootstrap.Modal(document.getElementById('progressModal'));
    modal.show();
}

// Hide progress modal
function hideProgressModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('progressModal'));
    if (modal) {
        modal.hide();
    }
}

// Update progress
function updateProgress(message, progress) {
    document.getElementById('progressMessage').textContent = message;
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('progressBar').setAttribute('aria-valuenow', progress);
}

// Hide preview modal
function hidePreviewModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('previewModal'));
    if (modal) {
        modal.hide();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Export configuration
function exportConfig() {
    const formData = getFormData();
    
    const config = {
        agent: formData,
        metadata: {
            exported: new Date().toISOString(),
            version: '1.0.0',
            animus: 'Create Agent Configuration'
        }
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-config-${formData.agentName || 'unnamed'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Configuration exported successfully', 'success');
}

// Import configuration
function importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const config = JSON.parse(e.target.result);
                
                if (config.agent) {
                    // Populate form with imported data
                    Object.keys(config.agent).forEach(key => {
                        const element = document.getElementById(key);
                        if (element) {
                            if (element.type === 'checkbox') {
                                element.checked = config.agent[key];
                            } else {
                                element.value = config.agent[key];
                            }
                        }
                    });
                    
                    // Update preview and summary
                    updatePreview();
                    updateConfigSummary();
                    
                    showNotification('Configuration imported successfully', 'success');
                } else {
                    showNotification('Invalid configuration file', 'error');
                }
            } catch (error) {
                console.error('Error parsing config file:', error);
                showNotification('Error parsing configuration file', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}
