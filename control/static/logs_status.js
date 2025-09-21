// Logs & Status Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeLogsStatus();
});

// Mock data for demonstration
const mockData = {
    logs: [
        {
            timestamp: '2024-01-15 10:30:15',
            level: 'INFO',
            module: 'Chat Handler',
            message: 'Processing user message: "Hello, how are you?"',
            details: {
                userId: 'user_123',
                messageId: 'msg_456',
                processingTime: '45ms',
                tokens: 12
            }
        },
        {
            timestamp: '2024-01-15 10:29:45',
            level: 'DEBUG',
            module: 'Memory Manager',
            message: 'Memory allocation successful: 2.4MB',
            details: {
                allocationType: 'heap',
                size: '2.4MB',
                available: '156.8MB',
                fragmentation: '2.1%'
            }
        },
        {
            timestamp: '2024-01-15 10:28:30',
            level: 'WARNING',
            module: 'Network Handler',
            message: 'Connection timeout detected, retrying...',
            details: {
                endpoint: 'api.openai.com',
                timeout: '30s',
                retryCount: 2,
                maxRetries: 3
            }
        },
        {
            timestamp: '2024-01-15 10:27:15',
            level: 'ERROR',
            module: 'Database Connector',
            message: 'Failed to establish database connection',
            details: {
                database: 'animus_main',
                host: 'localhost:5432',
                errorCode: 'ECONNREFUSED',
                retryAttempts: 5
            }
        }
    ],
    alerts: [
        {
            id: 'alert_001',
            severity: 'WARNING',
            type: 'System',
            title: 'High Memory Usage',
            message: 'Memory usage has exceeded 80% threshold',
            timestamp: '2024-01-15 08:30:00',
            status: 'Active',
            acknowledged: false,
            details: {
                currentUsage: '85%',
                threshold: '80%',
                recommendation: 'Consider restarting non-critical services'
            }
        },
        {
            id: 'alert_002',
            severity: 'CRITICAL',
            type: 'Database',
            title: 'Database Connection Failed',
            message: 'Unable to establish database connection',
            timestamp: '2024-01-15 09:15:00',
            status: 'Active',
            acknowledged: false,
            details: {
                database: 'animus_main',
                errorCode: 'ECONNREFUSED',
                impact: 'High - All database operations affected',
                resolution: 'Check database service status and network connectivity'
            }
        }
    ],
    performance: {
        responseTime: [45, 52, 38, 67, 41, 58, 49, 63, 44, 51],
        memoryUsage: [45, 47, 49, 52, 48, 51, 53, 50, 46, 48],
        cpuUsage: [12, 15, 18, 22, 19, 16, 14, 20, 17, 13],
        diskUsage: [23, 23, 24, 24, 23, 24, 25, 24, 23, 24]
    }
};

// Initialize the page
function initializeLogsStatus() {
    updateStatusOverview();
    setupEventListeners();
    startStatusUpdates();
    loadMockData();
}

// Setup event listeners
function setupEventListeners() {
    // Log level filter change
    const logLevelFilter = document.getElementById('logLevel');
    if (logLevelFilter) {
        logLevelFilter.addEventListener('change', function() {
            filterLogs(this.value);
        });
    }

    // Time range selector change
    const timeRangeSelector = document.getElementById('timeRange');
    if (timeRangeSelector) {
        timeRangeSelector.addEventListener('change', function() {
            updatePerformanceCharts(this.value);
        });
    }

    // Alert filter change
    const alertFilter = document.getElementById('alertFilter');
    if (alertFilter) {
        alertFilter.addEventListener('change', function() {
            filterAlerts(this.value);
        });
    }
}

// Update status overview cards
function updateStatusOverview() {
    // Update agent status
    const agentStatus = document.getElementById('agentStatus');
    if (agentStatus) {
        agentStatus.textContent = 'Healthy';
        agentStatus.className = 'h4 mb-1 text-success';
    }

    // Update uptime
    const uptime = document.getElementById('uptime');
    if (uptime) {
        uptime.textContent = '2d 14h';
    }

    // Update memory usage
    const memoryUsage = document.getElementById('memoryUsage');
    if (memoryUsage) {
        memoryUsage.textContent = '45%';
    }

    // Update active connections
    const activeConnections = document.getElementById('activeConnections');
    if (activeConnections) {
        activeConnections.textContent = '12';
    }
}

// Start periodic status updates
function startStatusUpdates() {
    setInterval(() => {
        updateHealthMetrics();
        updateRecentActivity();
    }, 30000); // Update every 30 seconds
}

// Update health metrics
function updateHealthMetrics() {
    // Simulate real-time updates
    const cpuUsage = document.getElementById('cpuUsage');
    if (cpuUsage) {
        const newValue = Math.floor(Math.random() * 20) + 10;
        cpuUsage.textContent = `${newValue}%`;
        cpuUsage.className = newValue > 15 ? 'text-warning' : 'text-success';
    }

    const memoryUsageDetail = document.getElementById('memoryUsageDetail');
    if (memoryUsageDetail) {
        const newValue = Math.floor(Math.random() * 20) + 40;
        memoryUsageDetail.textContent = `${newValue}%`;
        memoryUsageDetail.className = newValue > 70 ? 'text-warning' : 'text-success';
    }
}

// Update recent activity
function updateRecentActivity() {
    const recentActivity = document.getElementById('recentActivity');
    if (!recentActivity) return;

    const activities = [
        { type: 'success', message: 'Chat request processed', time: 'Just now' },
        { type: 'info', message: 'Module update completed', time: '2 min ago' },
        { type: 'warning', message: 'Memory usage alert', time: '5 min ago' },
        { type: 'success', message: 'Backup completed', time: '15 min ago' },
        { type: 'info', message: 'Health check passed', time: '30 min ago' }
    ];

    recentActivity.innerHTML = activities.map(activity => `
        <div class="list-group-item bg-transparent border-secondary">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <small class="text-${activity.type}">●</small>
                    <span class="ms-2">${activity.message}</span>
                </div>
                <small class="text-muted">${activity.time}</small>
            </div>
        </div>
    `).join('');
}

// Load mock data
function loadMockData() {
    updateLogsTable();
    updateAlertsList();
    updateAlertHistory();
    updatePerformanceCharts('1h');
}

// Update logs table
function updateLogsTable() {
    const logsTableBody = document.getElementById('logsTableBody');
    if (!logsTableBody) return;

    logsTableBody.innerHTML = mockData.logs.map(log => `
        <tr class="log-entry ${log.level.toLowerCase()}">
            <td>${log.timestamp}</td>
            <td><span class="badge bg-${getLogLevelColor(log.level)}">${log.level}</span></td>
            <td>${log.module}</td>
            <td>${log.message}</td>
            <td>
                <button class="btn btn-outline-info btn-sm" onclick="viewLogDetails('${log.timestamp}')">👁️</button>
            </td>
        </tr>
    `).join('');
}

// Get log level color
function getLogLevelColor(level) {
    const colors = {
        'DEBUG': 'success',
        'INFO': 'info',
        'WARNING': 'warning',
        'ERROR': 'danger'
    };
    return colors[level] || 'secondary';
}

// Filter logs by level
function filterLogs(level) {
    const logsTableBody = document.getElementById('logsTableBody');
    if (!logsTableBody) return;

    const filteredLogs = level === 'all' 
        ? mockData.logs 
        : mockData.logs.filter(log => log.level.toLowerCase() === level);

    logsTableBody.innerHTML = filteredLogs.map(log => `
        <tr class="log-entry ${log.level.toLowerCase()}">
            <td>${log.timestamp}</td>
            <td><span class="badge bg-${getLogLevelColor(log.level)}">${log.level}</span></td>
            <td>${log.module}</td>
            <td>${log.message}</td>
            <td>
                <button class="btn btn-outline-info btn-sm" onclick="viewLogDetails('${log.timestamp}')">👁️</button>
            </td>
        </tr>
    `).join('');
}

// View log details
function viewLogDetails(timestamp) {
    const log = mockData.logs.find(l => l.timestamp === timestamp);
    if (!log) return;

    const logDetailsContent = document.getElementById('logDetailsContent');
    if (logDetailsContent) {
        logDetailsContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="text-primary">Log Information</h6>
                    <ul class="list-unstyled">
                        <li><strong>Timestamp:</strong> ${log.timestamp}</li>
                        <li><strong>Level:</strong> <span class="badge bg-${getLogLevelColor(log.level)}">${log.level}</span></li>
                        <li><strong>Module:</strong> ${log.module}</li>
                        <li><strong>Message:</strong> ${log.message}</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6 class="text-primary">Additional Details</h6>
                    <div class="bg-dark p-3 rounded">
                        <pre class="text-light mb-0">${JSON.stringify(log.details, null, 2)}</pre>
                    </div>
                </div>
            </div>
        `;
    }

    const modal = new bootstrap.Modal(document.getElementById('logDetailsModal'));
    modal.show();
}

// Update alerts list
function updateAlertsList() {
    const activeAlertsList = document.getElementById('activeAlertsList');
    if (!activeAlertsList) return;

    const activeAlerts = mockData.alerts.filter(alert => alert.status === 'Active');
    
    activeAlertsList.innerHTML = activeAlerts.map(alert => `
        <div class="list-group-item bg-transparent border-${getAlertBorderColor(alert.severity)}">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="d-flex align-items-center mb-1">
                        <span class="badge bg-${getAlertBadgeColor(alert.severity)} me-2">${alert.severity}</span>
                        <span class="fw-medium">${alert.title}</span>
                    </div>
                    <p class="mb-1 text-muted">${alert.message}</p>
                    <small class="text-muted">Detected ${formatTimeAgo(alert.timestamp)}</small>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-success btn-sm" onclick="acknowledgeAlert('${alert.id}')">✅</button>
                    <button class="btn btn-outline-info btn-sm" onclick="viewAlertDetails('${alert.id}')">👁️</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Get alert border color
function getAlertBorderColor(severity) {
    const colors = {
        'INFO': 'info',
        'WARNING': 'warning',
        'CRITICAL': 'danger'
    };
    return colors[severity] || 'secondary';
}

// Get alert badge color
function getAlertBadgeColor(severity) {
    const colors = {
        'INFO': 'info',
        'WARNING': 'warning',
        'CRITICAL': 'danger'
    };
    return colors[severity] || 'secondary';
}

// Update alert history
function updateAlertHistory() {
    const alertHistoryTable = document.getElementById('alertHistoryTable');
    if (!alertHistoryTable) return;

    // Combine active and resolved alerts
    const allAlerts = [
        ...mockData.alerts,
        {
            timestamp: '2024-01-15 09:15:00',
            severity: 'CRITICAL',
            type: 'System',
            message: 'High CPU usage detected',
            status: 'Resolved'
        },
        {
            timestamp: '2024-01-15 08:30:00',
            severity: 'WARNING',
            type: 'Network',
            message: 'Connection timeout',
            status: 'Resolved'
        }
    ];

    alertHistoryTable.innerHTML = allAlerts.map(alert => `
        <tr>
            <td>${alert.timestamp}</td>
            <td><span class="badge bg-${getAlertBadgeColor(alert.severity)}">${alert.severity}</span></td>
            <td>${alert.type}</td>
            <td>${alert.message}</td>
            <td><span class="badge bg-${alert.status === 'Resolved' ? 'success' : 'warning'}">${alert.status}</span></td>
            <td>
                <button class="btn btn-outline-info btn-sm" onclick="viewAlertHistory('${alert.timestamp}')">👁️</button>
            </td>
        </tr>
    `).join('');
}

// Filter alerts
function filterAlerts(severity) {
    const alertHistoryTable = document.getElementById('alertHistoryTable');
    if (!alertHistoryTable) return;

    const allAlerts = [
        ...mockData.alerts,
        {
            timestamp: '2024-01-15 09:15:00',
            severity: 'CRITICAL',
            type: 'System',
            message: 'High CPU usage detected',
            status: 'Resolved'
        },
        {
            timestamp: '2024-01-15 08:30:00',
            severity: 'WARNING',
            type: 'Network',
            message: 'Connection timeout',
            status: 'Resolved'
        }
    ];

    const filteredAlerts = severity === 'all' 
        ? allAlerts 
        : allAlerts.filter(alert => alert.severity.toLowerCase() === severity);

    alertHistoryTable.innerHTML = filteredAlerts.map(alert => `
        <tr>
            <td>${alert.timestamp}</td>
            <td><span class="badge bg-${getAlertBadgeColor(alert.severity)}">${alert.severity}</span></td>
            <td>${alert.type}</td>
            <td>${alert.message}</td>
            <td><span class="badge bg-${alert.status === 'Resolved' ? 'success' : 'warning'}">${alert.status}</span></td>
            <td>
                <button class="btn btn-outline-info btn-sm" onclick="viewAlertHistory('${alert.timestamp}')">👁️</button>
            </td>
        </tr>
    `).join('');
}

// Update performance charts
function updatePerformanceCharts(timeRange) {
    // This would typically integrate with a charting library like Chart.js
    // For now, we'll just update the placeholder content
    const responseTimeChart = document.getElementById('responseTimeChart');
    const memoryChart = document.getElementById('memoryChart');

    if (responseTimeChart) {
        responseTimeChart.innerHTML = `
            <div class="chart-placeholder">
                <div class="text-center text-muted py-4">
                    <div class="h4 mb-2">📈</div>
                    <p class="mb-0">Response time chart for ${timeRange}</p>
                    <small>Average: 45ms | Peak: 120ms</small>
                </div>
            </div>
        `;
    }

    if (memoryChart) {
        memoryChart.innerHTML = `
            <div class="chart-placeholder">
                <div class="text-center text-muted py-4">
                    <div class="h4 mb-2">📊</div>
                    <p class="mb-0">Memory usage chart for ${timeRange}</p>
                    <small>Current: 45% | Trend: Stable</small>
                </div>
            </div>
        `;
    }
}

// Acknowledge alert
function acknowledgeAlert(alertId) {
    const alert = mockData.alerts.find(a => a.id === alertId);
    if (alert) {
        alert.acknowledged = true;
        alert.status = 'Acknowledged';
        updateAlertsList();
        showNotification(`Alert "${alert.title}" acknowledged`, 'success');
    }
}

// Acknowledge all alerts
function acknowledgeAllAlerts() {
    mockData.alerts.forEach(alert => {
        alert.acknowledged = true;
        alert.status = 'Acknowledged';
    });
    updateAlertsList();
    showNotification('All alerts acknowledged', 'success');
}

// View alert details
function viewAlertDetails(alertId) {
    const alert = mockData.alerts.find(a => a.id === alertId);
    if (!alert) return;

    const alertDetailsContent = document.getElementById('alertDetailsContent');
    if (alertDetailsContent) {
        alertDetailsContent.innerHTML = `
            <div class="mb-3">
                <h6 class="text-primary">Alert Information</h6>
                <ul class="list-unstyled">
                    <li><strong>ID:</strong> ${alert.id}</li>
                    <li><strong>Severity:</strong> <span class="badge bg-${getAlertBadgeColor(alert.severity)}">${alert.severity}</span></li>
                    <li><strong>Type:</strong> ${alert.type}</li>
                    <li><strong>Title:</strong> ${alert.title}</li>
                    <li><strong>Message:</strong> ${alert.message}</li>
                    <li><strong>Timestamp:</strong> ${alert.timestamp}</li>
                    <li><strong>Status:</strong> <span class="badge bg-${alert.status === 'Active' ? 'warning' : 'success'}">${alert.status}</span></li>
                </ul>
            </div>
            <div class="mb-3">
                <h6 class="text-primary">Details</h6>
                <div class="bg-dark p-3 rounded">
                    <pre class="text-light mb-0">${JSON.stringify(alert.details, null, 2)}</pre>
                </div>
            </div>
        `;
    }

    const modal = new bootstrap.Modal(document.getElementById('alertDetailsModal'));
    modal.show();
}

// View alert history
function viewAlertHistory(timestamp) {
    // This would show historical alert details
    showNotification('Alert history details would be displayed here', 'info');
}

// Refresh functions
function refreshHealthMetrics() {
    updateHealthMetrics();
    showNotification('Health metrics refreshed', 'success');
}

function refreshLogs() {
    updateLogsTable();
    showNotification('Logs refreshed', 'success');
}

function refreshPerformance() {
    const timeRange = document.getElementById('timeRange')?.value || '1h';
    updatePerformanceCharts(timeRange);
    showNotification('Performance data refreshed', 'success');
}

function refreshAlerts() {
    updateAlertsList();
    updateAlertHistory();
    showNotification('Alerts refreshed', 'success');
}

// Export functions
function exportActivity() {
    const data = {
        timestamp: new Date().toISOString(),
        activities: [
            { type: 'success', message: 'Chat request processed', time: 'Just now' },
            { type: 'info', message: 'Module update completed', time: '2 min ago' },
            { type: 'warning', message: 'Memory usage alert', time: '5 min ago' }
        ]
    };

    downloadJSON(data, 'recent-activity.json');
    showNotification('Activity data exported', 'success');
}

function downloadLogs() {
    const data = {
        timestamp: new Date().toISOString(),
        logs: mockData.logs
    };

    downloadJSON(data, 'system-logs.json');
    showNotification('Logs exported', 'success');
}

function exportAlertHistory() {
    const data = {
        timestamp: new Date().toISOString(),
        alerts: mockData.alerts
    };

    downloadJSON(data, 'alert-history.json');
    showNotification('Alert history exported', 'success');
}

// Utility functions
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

function clearLogs() {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
        const logsTableBody = document.getElementById('logsTableBody');
        if (logsTableBody) {
            logsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">No logs available</td>
                </tr>
            `;
        }
        showNotification('Logs cleared', 'success');
    }
}

// Notification system
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








