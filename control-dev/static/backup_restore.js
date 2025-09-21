// Backup & Restore Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeBackupRestore();
});

// Mock data for demonstration
let backupData = {
    backups: [
        {
            id: 'backup_001',
            name: 'animus-full-backup-2024-01-15',
            type: 'full',
            size: '2.4 GB',
            created: '2024-01-15 14:30:00',
            status: 'completed',
            verified: true
        },
        {
            id: 'backup_002',
            name: 'animus-config-backup-2024-01-14',
            type: 'config',
            size: '156 MB',
            created: '2024-01-14 02:00:00',
            status: 'completed',
            verified: true
        },
        {
            id: 'backup_003',
            name: 'animus-modules-backup-2024-01-13',
            type: 'modules',
            size: '892 MB',
            created: '2024-01-13 02:00:00',
            status: 'completed',
            verified: true
        },
        {
            id: 'backup_004',
            name: 'animus-emergency-backup-2024-01-12',
            type: 'full',
            size: '2.1 GB',
            created: '2024-01-12 18:45:00',
            status: 'completed',
            verified: false
        }
    ],
    autoBackupConfig: {
        enabled: false,
        frequency: 'weekly',
        time: '02:00',
        retention: 'keep_7',
        storageLocation: '/var/backups/animus',
        notifyOnBackup: false
    },
    storageInfo: {
        totalSpace: '500 GB',
        usedSpace: '45.2 GB',
        availableSpace: '454.8 GB',
        backupSpace: '12.3 GB'
    }
};

// Initialize the page
function initializeBackupRestore() {
    updateStatusOverview();
    updateBackupsTable();
    loadAutoBackupConfig();
    setupEventListeners();
    setupFormValidation();
}

// Update status overview cards
function updateStatusOverview() {
    document.getElementById('totalBackups').textContent = backupData.backups.length;
    
    if (backupData.backups.length > 0) {
        const lastBackup = backupData.backups[0];
        document.getElementById('lastBackup').textContent = formatDate(lastBackup.created);
        
        // Calculate total size
        const totalSize = backupData.backups.reduce((total, backup) => {
            return total + parseFloat(backup.size.replace(' GB', '').replace(' MB', ''));
        }, 0);
        document.getElementById('backupSize').textContent = totalSize > 1 ? `${totalSize.toFixed(1)} GB` : `${(totalSize * 1024).toFixed(0)} MB`;
    } else {
        document.getElementById('lastBackup').textContent = 'Never';
        document.getElementById('backupSize').textContent = '0 MB';
    }
    
    document.getElementById('autoBackup').textContent = backupData.autoBackupConfig.enabled ? 'On' : 'Off';
}

// Update backups table
function updateBackupsTable() {
    const tbody = document.getElementById('backupsTableBody');
    if (tbody) {
        if (backupData.backups.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No backups found</td></tr>';
        } else {
            tbody.innerHTML = backupData.backups.map(backup => `
                <tr>
                    <td>
                        <strong>${backup.name}</strong>
                        ${backup.verified ? '<span class="badge bg-success ms-2">✓ Verified</span>' : '<span class="badge bg-warning ms-2">⚠ Unverified</span>'}
                    </td>
                    <td><span class="badge bg-info">${backup.type}</span></td>
                    <td>${backup.size}</td>
                    <td>${formatDate(backup.created)}</td>
                    <td><span class="badge bg-success">${backup.status}</span></td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary btn-sm" onclick="downloadBackup('${backup.id}')">📥 Download</button>
                            <button class="btn btn-outline-info btn-sm" onclick="verifyBackup('${backup.id}')">✅ Verify</button>
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteBackup('${backup.id}')">🗑️ Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
}

// Load auto backup configuration
function loadAutoBackupConfig() {
    const config = backupData.autoBackupConfig;
    
    document.getElementById('enableAutoBackup').checked = config.enabled;
    document.getElementById('backupFrequency').value = config.frequency;
    document.getElementById('backupTime').value = config.time;
    document.getElementById('retentionPolicy').value = config.retention;
    document.getElementById('storageLocation').value = config.storageLocation;
    document.getElementById('notifyOnBackup').checked = config.notifyOnBackup;
    
    // Enable/disable fields based on auto backup status
    toggleAutoBackupFields(config.enabled);
}

// Toggle auto backup fields
function toggleAutoBackupFields(enabled) {
    const fields = ['backupFrequency', 'backupTime', 'retentionPolicy', 'storageLocation', 'notifyOnBackup'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.disabled = !enabled;
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Backup form submission
    const backupForm = document.getElementById('backupForm');
    if (backupForm) {
        backupForm.addEventListener('submit', handleBackupSubmit);
    }
    
    // Restore form submission
    const restoreForm = document.getElementById('restoreForm');
    if (restoreForm) {
        restoreForm.addEventListener('submit', handleRestoreSubmit);
    }
    
    // Auto backup form submission
    const autoBackupForm = document.getElementById('autoBackupForm');
    if (autoBackupForm) {
        autoBackupForm.addEventListener('submit', handleAutoBackupSubmit);
    }
    
    // Auto backup toggle
    const enableAutoBackup = document.getElementById('enableAutoBackup');
    if (enableAutoBackup) {
        enableAutoBackup.addEventListener('change', function() {
            toggleAutoBackupFields(this.checked);
        });
    }
    
    // File input change
    const backupFile = document.getElementById('backupFile');
    if (backupFile) {
        backupFile.addEventListener('change', function() {
            const restoreBtn = document.getElementById('restoreBtn');
            if (restoreBtn) {
                restoreBtn.disabled = !this.files.length;
            }
        });
    }
    
    // Overwrite checkbox
    const overwriteExisting = document.getElementById('overwriteExisting');
    if (overwriteExisting) {
        overwriteExisting.addEventListener('change', function() {
            const restoreBtn = document.getElementById('restoreBtn');
            if (restoreBtn) {
                restoreBtn.disabled = !this.checked;
            }
        });
    }
}

// Setup form validation
function setupFormValidation() {
    // Backup name validation
    const backupName = document.getElementById('backupName');
    if (backupName) {
        backupName.addEventListener('input', function() {
            if (this.value && !/^[a-zA-Z0-9\-_]+$/.test(this.value)) {
                this.classList.add('is-invalid');
                this.setCustomValidity('Backup name can only contain letters, numbers, hyphens, and underscores');
            } else {
                this.classList.remove('is-invalid');
                this.setCustomValidity('');
            }
        });
    }
}

// Handle backup form submission
function handleBackupSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const backupConfig = {
        name: formData.get('backupName') || generateBackupName(),
        type: formData.get('backupType'),
        compression: formData.get('compressionType'),
        includeLogs: formData.get('includeLogs') === 'on',
        verifyBackup: formData.get('verifyBackup') === 'on'
    };
    
    console.log('Creating backup with config:', backupConfig);
    
    // Show progress modal
    showProgressModal('Creating Backup', 'Initializing backup process...');
    
    // Simulate backup process
    simulateBackupProcess(backupConfig);
}

// Handle restore form submission
function handleRestoreSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const restoreConfig = {
        file: document.getElementById('backupFile').files[0],
        type: formData.get('restoreType'),
        createRestorePoint: formData.get('createRestorePoint') === 'on'
    };
    
    console.log('Restoring from backup:', restoreConfig);
    
    // Show confirmation modal
    showConfirmModal(
        'Confirm Restore',
        `Are you sure you want to restore the system from "${restoreConfig.file.name}"? This will overwrite existing data and cannot be undone.`,
        () => performRestore(restoreConfig)
    );
}

// Handle auto backup form submission
function handleAutoBackupSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const config = {
        enabled: formData.get('enableAutoBackup') === 'on',
        frequency: formData.get('backupFrequency'),
        time: formData.get('backupTime'),
        retention: formData.get('retentionPolicy'),
        storageLocation: formData.get('storageLocation'),
        notifyOnBackup: formData.get('notifyOnBackup') === 'on'
    };
    
    console.log('Saving auto backup config:', config);
    
    // Update mock data
    backupData.autoBackupConfig = config;
    
    // Update UI
    updateStatusOverview();
    
    showNotification('Auto backup configuration saved successfully', 'success');
}

// Generate backup name
function generateBackupName() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `animus-backup-${dateStr}-${timeStr}`;
}

// Simulate backup process
function simulateBackupProcess(config) {
    const steps = [
        { message: 'Scanning system files...', progress: 10 },
        { message: 'Creating backup archive...', progress: 30 },
        { message: 'Compressing data...', progress: 50 },
        { message: 'Writing to storage...', progress: 70 },
        { message: 'Verifying backup integrity...', progress: 90 },
        { message: 'Finalizing backup...', progress: 100 }
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
                completeBackup(config);
            }, 1000);
        }
    }, 1500);
}

// Complete backup process
function completeBackup(config) {
    // Create new backup entry
    const newBackup = {
        id: `backup_${Date.now()}`,
        name: config.name,
        type: config.type,
        size: `${(Math.random() * 3 + 0.5).toFixed(1)} GB`,
        created: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'completed',
        verified: config.verifyBackup
    };
    
    // Add to beginning of list
    backupData.backups.unshift(newBackup);
    
    // Update UI
    updateStatusOverview();
    updateBackupsTable();
    
    showNotification(`Backup "${config.name}" created successfully`, 'success');
}

// Perform restore
function performRestore(config) {
    hideConfirmModal();
    
    // Show progress modal
    showProgressModal('Restoring System', 'Initializing restore process...');
    
    // Simulate restore process
    simulateRestoreProcess(config);
}

// Simulate restore process
function simulateRestoreProcess(config) {
    const steps = [
        { message: 'Creating restore point...', progress: 10 },
        { message: 'Validating backup file...', progress: 25 },
        { message: 'Extracting backup data...', progress: 40 },
        { message: 'Restoring system files...', progress: 60 },
        { message: 'Updating configuration...', progress: 80 },
        { message: 'Finalizing restore...', progress: 100 }
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
                completeRestore(config);
            }, 1000);
        }
    }, 2000);
}

// Complete restore process
function completeRestore(config) {
    showNotification('System restored successfully. A restart may be required.', 'success');
    
    // Reset form
    document.getElementById('restoreForm').reset();
    document.getElementById('restoreBtn').disabled = true;
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

// Show confirmation modal
function showConfirmModal(title, message, onConfirm) {
    document.getElementById('confirmModalTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const confirmBtn = document.getElementById('confirmActionBtn');
    confirmBtn.onclick = () => {
        onConfirm();
        hideConfirmModal();
    };
    
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

// Hide confirmation modal
function hideConfirmModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
    if (modal) {
        modal.hide();
    }
}

// Action functions
function refreshBackups() {
    console.log('Refreshing backups...');
    // Simulate API call
    setTimeout(() => {
        updateBackupsTable();
        showNotification('Backups refreshed successfully', 'success');
    }, 1000);
}

function exportBackupList() {
    console.log('Exporting backup list...');
    const backupList = backupData.backups.map(backup => ({
        name: backup.name,
        type: backup.type,
        size: backup.size,
        created: backup.created,
        status: backup.status,
        verified: backup.verified
    }));
    
    const blob = new Blob([JSON.stringify(backupList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animus-backups.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Backup list exported successfully', 'success');
}

function downloadBackup(backupId) {
    const backup = backupData.backups.find(b => b.id === backupId);
    if (backup) {
        console.log(`Downloading backup: ${backup.name}`);
        showNotification(`Download started for ${backup.name}`, 'info');
    }
}

function verifyBackup(backupId) {
    const backup = backupData.backups.find(b => b.id === backupId);
    if (backup) {
        console.log(`Verifying backup: ${backup.name}`);
        
        // Simulate verification
        setTimeout(() => {
            backup.verified = true;
            updateBackupsTable();
            showNotification(`Backup ${backup.name} verified successfully`, 'success');
        }, 2000);
    }
}

function deleteBackup(backupId) {
    const backup = backupData.backups.find(b => b.id === backupId);
    if (backup) {
        showConfirmModal(
            'Delete Backup',
            `Are you sure you want to delete "${backup.name}"? This action cannot be undone.`,
            () => {
                backupData.backups = backupData.backups.filter(b => b.id !== backupId);
                updateStatusOverview();
                updateBackupsTable();
                showNotification(`Backup ${backup.name} deleted successfully`, 'success');
            }
        );
    }
}

function resetAutoBackupConfig() {
    console.log('Resetting auto backup config...');
    
    const defaultConfig = {
        enabled: false,
        frequency: 'weekly',
        time: '02:00',
        retention: 'keep_7',
        storageLocation: '/var/backups/animus',
        notifyOnBackup: false
    };
    
    backupData.autoBackupConfig = defaultConfig;
    loadAutoBackupConfig();
    
    showNotification('Auto backup configuration reset to defaults', 'info');
}

// Maintenance action functions
function checkStorageSpace() {
    console.log('Checking storage space...');
    showNotification(`Storage: ${backupData.storageInfo.usedSpace} used of ${backupData.storageInfo.totalSpace}`, 'info');
}

function cleanupOldBackups() {
    console.log('Cleaning up old backups...');
    showNotification('Old backup cleanup completed', 'success');
}

function validateAllBackups() {
    console.log('Validating all backups...');
    showNotification('All backups validated successfully', 'success');
}

function testBackupProcess() {
    console.log('Testing backup process...');
    showNotification('Backup test completed successfully', 'success');
}

function showBackupLogs() {
    console.log('Showing backup logs...');
    showNotification('Backup logs would open here', 'info');
}

function exportBackupConfig() {
    console.log('Exporting backup configuration...');
    showNotification('Backup configuration exported successfully', 'success');
}

function emergencyBackup() {
    console.log('Creating emergency backup...');
    showNotification('Emergency backup initiated', 'warning');
}

function importBackupConfig() {
    console.log('Importing backup configuration...');
    showNotification('Backup configuration import dialog would open here', 'info');
}

function showBackupStats() {
    console.log('Showing backup statistics...');
    showNotification('Backup statistics would display here', 'info');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
            notification.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px; max-width: 400px;';
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
