/**
 * Animus Control Interface - Chat JavaScript
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

// Chat interface functionality
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.querySelector('textarea');
    const form = document.querySelector('form');
    const transcript = document.getElementById('transcript');

    // Check authentication status
    function checkAuth() {
        // Check if user info is available in the page
        const userInfo = document.querySelector('[data-username]');
        if (!userInfo) {
            console.log('No user info found, redirecting to login...');
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    // Get current user info
    function getCurrentUser() {
        const userInfo = document.querySelector('[data-username]');
        if (userInfo) {
            return {
                username: userInfo.dataset.username,
                role: userInfo.dataset.role
            };
        }
        return null;
    }

    // Load user's available agents
    async function loadUserAgents() {
        try {
            const response = await fetch('/api/agents');
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            
            const agents = await response.json();
            if (agents && agents.length > 0) {
                updateAgentDropdown(agents);
                updateWelcomeMessage(agents[0]); // Use first agent as default
            } else {
                console.log('No agents available');
            }
        } catch (error) {
            console.error('Error loading agents:', error);
        }
    }

    // Update agent dropdown
    function updateAgentDropdown(agents) {
        const dropdown = document.getElementById('agentDropdown');
        const agentList = document.getElementById('agentList');
        
        if (dropdown && agentList) {
            // Set default agent
            dropdown.textContent = agents[0].name;
            
            // Update the current agent name display
            updateAgentDisplay(agents[0]);
            
            // Clear and populate agent list
            agentList.innerHTML = '';
            agents.forEach(agent => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.className = 'dropdown-item';
                a.href = '#';
                a.dataset.agent = agent.id;
                a.textContent = agent.name;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    selectAgent(agent);
                });
                li.appendChild(a);
                agentList.appendChild(li);
            });
        }
    }

    // Select an agent
    function selectAgent(agent) {
        const dropdown = document.getElementById('agentDropdown');
        if (dropdown) {
            dropdown.textContent = agent.name;
        }
        updateWelcomeMessage(agent);
        updateAgentDisplay(agent);
    }

    // Update welcome message with selected agent
    function updateWelcomeMessage(agent) {
        const welcomeName = document.getElementById('welcomeAgentName');
        if (welcomeName) {
            welcomeName.textContent = agent.name;
        }
    }

    // Load user's agents on page load
    loadUserAgents();
    
    // Start polling for new messages from the working Flask system
    startMessagePolling();

    // Auto-expand textarea
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        // Handle Enter key (Shift+Enter for new line)
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });
    }

    // Handle form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check authentication before sending message
            if (!checkAuth()) {
                return;
            }
            
            console.log('Form submitted');
            const message = textarea.value.trim();
            console.log('Message:', message);
            if (message) {
                addUserMessage(message);
                textarea.value = '';
                textarea.style.height = 'auto';
                
                console.log('Sending message to working Flask system...');
                
                // Generate a unique session ID for this chat session
                const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                // Show typing indicator
                const currentAgent = getCurrentAgent();
                if (currentAgent) {
                    showTypingIndicator(currentAgent.name);
                }
                
                // Send message to working Flask system's API
                fetch('/api/v1/?action=messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        message: message,
                        session_id: sessionId,
                        uid: 'user_' + Date.now()
                    })
                })
                .then(response => {
                    console.log('Working Flask system response status:', response.status);
                    if (response.status === 401) {
                        // Session expired, redirect to login
                        window.location.href = '/login';
                        return;
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.error) {
                        addAssistantMessage("Error: " + data.error);
                    } else if (data && data.success) {
                        // Message was sent successfully, now poll for responses
                        pollForResponses(sessionId);
                    } else {
                        addAssistantMessage("Message sent, waiting for response...");
                        // Fallback: poll for responses anyway
                        pollForResponses(sessionId);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    addAssistantMessage("Sorry, there was an error processing your message.");
                });
            }
        });
    }

    // Add user message to transcript
    function addUserMessage(text) {
        console.log('Adding user message:', text);
        const user = getCurrentUser();
        const username = user ? user.username : 'User';
        const userInitial = username.charAt(0).toUpperCase();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'd-flex justify-content-end mb-3';
        const timestamp = getCurrentTimestamp();
        messageDiv.innerHTML = `
            <div class="d-flex align-items-start gap-3 flex-row-reverse">
                <div class="message-avatar">
                    <div class="avatar-circle avatar-user">${userInitial}</div>
                    <div class="avatar-name">${username}</div>
                </div>
                <div class="p-3 rounded-3 bubble-user">
                    <p class="mb-0">${escapeHtml(text)}</p>
                    <div class="message-actions">
                        <span class="message-timestamp" title="${timestamp}">${timestamp}</span>
                        <div class="d-flex">
                            <button class="btn btn-sm btn-outline-secondary copy-btn" title="Copy message">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            </button>
                            <button class="btn btn-sm btn-outline-secondary share-btn" title="Share message">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                    <polyline points="16,6 12,2 8,6"></polyline>
                                    <line x1="12" y1="2" x2="12" y2="15"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        transcript.querySelector('.container').appendChild(messageDiv);
        addMessageActionHandlers(messageDiv);
        scrollToBottom();
    }

    // Add assistant message to transcript
    function addAssistantMessage(text) {
        console.log('Adding assistant message:', text);
        const currentAgent = getCurrentAgent();
        const agentName = currentAgent ? currentAgent.name : 'Agent';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'd-flex mb-3';
        const timestamp = getCurrentTimestamp();
        messageDiv.innerHTML = `
            <div class="d-flex align-items-start gap-3">
                <div class="message-avatar">
                    <div class="avatar-circle avatar-assistant">A</div>
                    <div class="avatar-name">${agentName}</div>
                </div>
                <div class="p-3 rounded-3 bubble-assistant">
                    <p class="mb-0">${escapeHtml(text)}</p>
                    <div class="message-actions">
                        <span class="message-timestamp" title="${timestamp}">${timestamp}</span>
                        <div class="d-flex">
                            <button class="btn btn-sm btn-outline-secondary copy-btn" title="Copy message">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            </button>
                            <button class="btn btn-sm btn-outline-secondary share-btn" title="Share message">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                    <polyline points="16,6 12,2 8,6"></polyline>
                                    <line x1="12" y1="2" x2="12" y2="15"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        transcript.querySelector('.container').appendChild(messageDiv);
        addMessageActionHandlers(messageDiv);
        scrollToBottom();
    }

    // Add tool output message to transcript
    function addToolOutputMessage(text, toolName = "Tool Output") {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'd-flex mb-3';
        const timestamp = getCurrentTimestamp();
        messageDiv.innerHTML = `
            <div class="d-flex align-items-start gap-3">
                <div class="message-avatar">
                    <div class="avatar-circle avatar-tool">⚙</div>
                    <div class="avatar-name">Tool</div>
                </div>
                <div class="p-3 rounded-3 border bubble-tool">
                    <div class="tool-header">
                        <span class="tool-chip">${escapeHtml(toolName)}</span>
                    </div>
                    <pre class="mb-0">${escapeHtml(text)}</pre>
                    <div class="message-actions">
                        <span class="message-timestamp" title="${timestamp}">${timestamp}</span>
                        <div class="d-flex">
                            <button class="btn btn-sm btn-outline-secondary copy-all-btn" title="Copy all">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        transcript.querySelector('.container').appendChild(messageDiv);
        addMessageActionHandlers(messageDiv);
        scrollToBottom();
    }

    // Scroll to bottom of transcript
    function scrollToBottom() {
        transcript.scrollTop = transcript.scrollHeight;
        hideJumpToBottom();
    }

    // Show/hide jump to bottom button
    function showJumpToBottom() {
        const jumpBtn = document.getElementById('jump-to-bottom');
        if (jumpBtn) {
            jumpBtn.classList.remove('d-none');
        }
    }

    function hideJumpToBottom() {
        const jumpBtn = document.getElementById('jump-to-bottom');
        if (jumpBtn) {
            jumpBtn.classList.add('d-none');
        }
    }

    // Handle scroll events to show/hide jump button
    function handleScroll() {
        const isAtBottom = transcript.scrollTop + transcript.clientHeight >= transcript.scrollHeight - 200;
        if (isAtBottom) {
            hideJumpToBottom();
        } else {
            showJumpToBottom();
        }
    }

    // Get current timestamp in readable format
    function getCurrentTimestamp() {
        const now = new Date();
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (now.toDateString() === today.toDateString()) {
            return `Today, ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        } else if (now.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        } else {
            return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + 
                   now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Focus textarea on page load
    if (textarea) {
        textarea.focus();
    }

    // Scroll to bottom on page load to show most recent messages
    scrollToBottom();

    // Add action handlers to existing messages
    addMessageActionHandlersToExisting();

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Add scroll listener for jump to bottom button
    transcript.addEventListener('scroll', handleScroll);

    // Add click handler for jump to bottom button
    const jumpBtn = document.getElementById('jump-to-bottom');
    if (jumpBtn) {
        jumpBtn.addEventListener('click', scrollToBottom);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key focuses composer
        if (e.key === 'Escape') {
            if (textarea) {
                textarea.focus();
            }
        }
    });

    // Function to add action handlers to existing messages
    function addMessageActionHandlersToExisting() {
        const existingMessages = transcript.querySelectorAll('.message-actions');
        existingMessages.forEach(addMessageActionHandlers);
    }

    // Function to add action handlers to a message
    function addMessageActionHandlers(messageDiv) {
        const copyBtn = messageDiv.querySelector('.copy-btn');
        const shareBtn = messageDiv.querySelector('.share-btn');
        const copyAllBtn = messageDiv.querySelector('.copy-all-btn');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                const messageText = messageDiv.querySelector('p, pre').textContent;
                copyToClipboard(messageText);
                
                // Visual feedback
                const originalText = this.innerHTML;
                this.innerHTML = `
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                `;
                this.classList.add('btn-success');
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.classList.remove('btn-success');
                }, 2000);
            });
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', function() {
                const messageText = messageDiv.querySelector('p, pre').textContent;
                shareMessage(messageText);
            });
        }
        
        if (copyAllBtn) {
            copyAllBtn.addEventListener('click', function() {
                const messageText = messageDiv.querySelector('p, pre').textContent;
                copyToClipboard(messageText);
                
                // Visual feedback
                const originalText = this.innerHTML;
                this.innerHTML = `
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                `;
                this.classList.add('btn-success');
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.classList.remove('btn-success');
                }, 2000);
            });
        }
    }

    // Function to copy text to clipboard
    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Text copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                fallbackCopyTextToClipboard(text);
            });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    }

    // Fallback copy method for older browsers
    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            console.log('Text copied to clipboard (fallback)');
        } catch (err) {
            console.error('Fallback copy failed: ', err);
        }
        
        document.body.removeChild(textArea);
    }

    // Function to share message
    function shareMessage(text) {
        if (navigator.share) {
            navigator.share({
                title: 'Message from Animus',
                text: text,
                url: window.location.href
            }).then(() => {
                console.log('Message shared successfully');
            }).catch(err => {
                console.error('Error sharing message: ', err);
                fallbackShare(text);
            });
        } else {
            fallbackShare(text);
        }
    }

    // Fallback share method
    function fallbackShare(text) {
        // Create a temporary textarea to copy the shareable link
        const shareText = `Message from Sanctum:\n\n${text}\n\n${window.location.href}`;
        copyToClipboard(shareText);
        
        // Show feedback
        const shareBtn = document.querySelector('.share-btn');
        if (shareBtn) {
            const originalText = shareBtn.innerHTML;
            shareBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>

            `;
            shareBtn.classList.add('btn-success');
            
            setTimeout(() => {
                shareBtn.innerHTML = originalText;
                shareBtn.classList.remove('btn-success');
            }, 2000);
        }
    }

    // Agent switching functionality
    const agentDropdown = document.querySelector('.dropdown-toggle');
    const agentDropdownMenu = document.querySelector('.dropdown-menu');
    
    if (agentDropdown && agentDropdownMenu) {
        // Handle agent selection
        agentDropdownMenu.addEventListener('click', function(e) {
            if (e.target.classList.contains('dropdown-item')) {
                e.preventDefault();
                const agentName = e.target.textContent;
                const agentId = e.target.dataset.agent;
                
                // Update the dropdown button text
                agentDropdown.textContent = agentName;
                
                // Update the avatar (you can customize this per agent)
                const avatar = document.querySelector('.avatar-assistant');
                if (avatar) {
                    const firstLetter = agentName.charAt(0).toUpperCase();
                    avatar.textContent = firstLetter;
                }
                
                // Show loading state briefly, then refresh conversation
                showAgentLoading(agentName);
                setTimeout(() => {
                    refreshConversation(agentName);
                }, 200);
            }
        });
    }
    
    // Function to show loading state when switching agents
    function showAgentLoading(agentName) {
        // Update dropdown button to show loading
        if (agentDropdown) {
            agentDropdown.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading ${agentName}...`;
        }
    }
    
    // Function to refresh conversation for a new agent
    function refreshConversation(agentName) {
        // Update page title to show current agent
        document.title = `Chat with ${agentName} - Sanctum`;
        
        // Restore dropdown button text
        if (agentDropdown) {
            agentDropdown.textContent = agentName;
        }
        
        // Clear the transcript
        const transcriptContainer = transcript.querySelector('.container');
        transcriptContainer.innerHTML = '';
        
        // Add a fresh welcome message from the new agent
        setTimeout(() => {
            addAssistantMessage(`Hello! I'm ${agentName}. I'm now connected to the working Flask system and ready to help you!`);
        }, 100);
        
        // Scroll to bottom to show the new message
        scrollToBottom();
        
        // Clear the textarea
        if (textarea) {
            textarea.value = '';
            textarea.style.height = 'auto';
            textarea.focus();
        }
    }
    
    // Function to poll for responses from the working Flask system
    function pollForResponses(sessionId) {
        console.log('Polling for responses for session:', sessionId);
        
        // Poll every 2 seconds for up to 30 seconds
        let pollCount = 0;
        const maxPolls = 15;
        
        const pollInterval = setInterval(() => {
            pollCount++;
            
            fetch(`/api/v1/?action=responses&session_id=${sessionId}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.success && data.data && data.data.responses) {
                        const responses = data.data.responses;
                        if (responses.length > 0) {
                            // Clear the polling interval since we got responses
                            clearInterval(pollInterval);
                            
                            // Hide typing indicator since we got a response
                            hideTypingIndicator();
                            
                            // Display the responses
                            responses.forEach(response => {
                                addAssistantMessage(response.response || 'Response received');
                            });
                        }
                    }
                })
                .catch(error => {
                    console.error('Error polling for responses:', error);
                });
            
            // Stop polling after max attempts or if we got responses
            if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                console.log('Stopped polling for responses');
                // Hide typing indicator if no response received
                hideTypingIndicator();
            }
        }, 2000);
    }
    
    // Function to start continuous polling for new messages from the working Flask system
    function startMessagePolling() {
        console.log('Starting message polling from working Flask system...');
        
        // Poll every 5 seconds for new messages
        setInterval(() => {
            fetch('/api/v1/?action=inbox&limit=10&offset=0')
                .then(response => response.json())
                .then(data => {
                    if (data && data.success && data.data && data.data.messages) {
                        const messages = data.data.messages;
                        if (messages.length > 0) {
                            console.log('Received new messages from working Flask system:', messages.length);
                                           
                            // Display new messages
                            messages.forEach(msg => {
                                if (msg.message && !msg.processed) {
                                    addAssistantMessage(msg.message);
                                }
                            });
                        }
                    }
                })
                .catch(error => {
                    console.error('Error polling inbox:', error);
                });
        }, 5000);
    }

    // Function to show typing indicator
    function showTypingIndicator(agentName) {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'inline';
            typingIndicator.classList.add('show');
            console.log('Showing typing indicator for agent:', agentName);
        }
    }

    // Function to hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
            typingIndicator.classList.remove('show');
            console.log('Hiding typing indicator');
        }
    }

    // Function to get the currently selected agent
    function getCurrentAgent() {
        const dropdown = document.getElementById('agentDropdown');
        if (dropdown) {
            const agentName = dropdown.textContent.trim();
            const agents = document.querySelectorAll('.dropdown-item');
            for (const agent of agents) {
                if (agent.textContent.trim() === agentName) {
                    return {
                        name: agentName,
                        id: agent.dataset.agent
                    };
                }
            }
        }
        return null;
    }

    // Update the current agent name display and textarea placeholder
    function updateAgentDisplay(agent) {
        const currentAgentName = document.getElementById('current-agent-name');
        if (currentAgentName) {
            currentAgentName.textContent = agent.name;
        }
        
        const textarea = document.querySelector('textarea');
        if (textarea) {
            textarea.placeholder = `Message ${agent.name}…`;
        }
    }
});
