/**
 * Animus Control Interface - Settings JavaScript
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

// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize search functionality for all tabs
    initializeTabSearch();

    // Tool card interactions
    initializeToolCards();

    // Keyboard shortcuts
    initializeKeyboardShortcuts();

    // Focus search on page load
    focusActiveTabSearch();
});

// Function to initialize search functionality for all tabs
function initializeTabSearch() {
    // Get all tabs including dynamic agent tabs
    const allTabs = ['master', 'smcp'];
    
    // Add agent tabs if they exist
    const agentTabs = document.querySelectorAll('[id^="agent-"][id$="-tab"]');
    agentTabs.forEach(tab => {
        const tabId = tab.id.replace('agent-', '').replace('-tab', '');
        if (!allTabs.includes(tabId)) {
            allTabs.push(tabId);
        }
    });
    
    allTabs.forEach(tabName => {
        const searchInput = document.getElementById(`search${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tools`);
        const toolsGrid = document.getElementById(`${tabName}ToolsGrid`);
        const clearSearchBtn = document.getElementById(`clear${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Search`);
        const searchResults = document.getElementById(`${tabName}SearchResults`);
        
        if (searchInput && toolsGrid) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase().trim();
                const toolCards = toolsGrid.querySelectorAll('[data-tool-name]');
                let visibleCount = 0;
                
                toolCards.forEach(card => {
                    const toolName = card.dataset.toolName.toLowerCase();
                    const toolDesc = card.dataset.toolDesc.toLowerCase();
                    
                    if (toolName.includes(searchTerm) || toolDesc.includes(searchTerm)) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeInUp 0.3s ease-out';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Update results counter
                if (searchTerm) {
                    searchResults.textContent = `${visibleCount} result${visibleCount !== 1 ? 's' : ''}`;
                    searchResults.style.display = 'block';
                    
                    // Show clear button
                    if (clearSearchBtn) {
                        clearSearchBtn.classList.remove('d-none');
                    }
                } else {
                    searchResults.style.display = 'none';
                    
                    // Hide clear button
                    if (clearSearchBtn) {
                        clearSearchBtn.classList.add('d-none');
                    }
                }
            });
            
            // Clear search functionality
            if (clearSearchBtn) {
                clearSearchBtn.addEventListener('click', function() {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input'));
                    searchInput.focus();
                });
            }
        }
    });
}

// Initialize tool card interactions
function initializeToolCards() {
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on a button or link
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
                return;
            }
            
            // Add click effect
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// Initialize keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const activeTab = document.querySelector('.tab-pane.active');
            if (activeTab) {
                const searchInput = activeTab.querySelector('input[type="text"]');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            const activeTab = document.querySelector('.tab-pane.active');
            if (activeTab) {
                const searchInput = activeTab.querySelector('input[type="text"]');
                if (searchInput && searchInput.value) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input'));
                }
            }
        }
    });
}

// Focus search on page load
function focusActiveTabSearch() {
    const activeTab = document.querySelector('.tab-pane.active');
    if (activeTab) {
        const searchInput = activeTab.querySelector('input[type="text"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
}

// System update function
function updateSystem() {
    const button = event.target;
    const originalText = button.textContent;
    
    // Show loading state
    button.disabled = true;
    button.textContent = 'Updating...';
    button.classList.add('btn-secondary');
    button.classList.remove('btn-primary');
    
    // Simulate update process
    setTimeout(() => {
        // Show success state
        button.textContent = 'Updated!';
        button.classList.remove('btn-secondary');
        button.classList.add('btn-success');
        
        // Reset after 3 seconds
        setTimeout(() => {
            button.disabled = false;
            button.textContent = originalText;
            button.classList.remove('btn-success');
            button.classList.add('btn-primary');
        }, 3000);
    }, 2000);
}

// Initialize SMCP functionality only when on actual SMCP pages
document.addEventListener('shown.bs.tab', function(e) {
    // Only initialize SMCP panels if we're on an actual SMCP page
    // The SMCP tab in settings is just a navigation hub
    if (e.target.id === 'smcp-tab') {
        // Don't initialize panels here - they don't exist in the settings page
        // Just ensure the tab is properly activated
        console.log('SMCP tab activated in settings');
    }
});

// Initialize all SMCP panels - only call this on actual SMCP pages
function initializeSmcpPanels() {
    // Check if we're on an actual SMCP page before trying to update panels
    if (window.location.pathname.includes('/smcp-')) {
        updateOverviewPanel();
        updatePluginsPanel();
        updateToolsPanel();
        updateSessionsPanel();
        updateHealthPanel();
        startSmcpUpdates();
    }
}
