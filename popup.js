// Popup script for DontVisit Website Blocker
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DontVisit popup loaded');
    
    // Initialize the popup
    await initializePopup();
    
    // Set up event listeners
    setupEventListeners();
});

// Initialize popup with current data
async function initializePopup() {
    try {
        // Load current tab info
        await loadCurrentTabInfo();
        
        // Load blocked sites and settings
        await loadBlockedSites();
        
        // Load statistics
        await loadStatistics();
        
        // Load settings
        await loadSettings();
        
    } catch (error) {
        console.error('Error initializing popup:', error);
        showStatus('Error loading extension data', 'error');
    }
}

// Load current tab information
async function loadCurrentTabInfo() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getCurrentTabInfo' });
        
        if (response.success && response.tab) {
            const currentUrlElement = document.getElementById('current-url');
            const blockCurrentBtn = document.getElementById('block-current-site');
            
            if (response.tab.url && !response.tab.url.startsWith('chrome://') && !response.tab.url.startsWith('edge://')) {
                const domain = new URL(response.tab.url).hostname;
                currentUrlElement.textContent = domain;
                blockCurrentBtn.disabled = false;
                
                // Store current domain for blocking
                blockCurrentBtn.dataset.domain = domain;
            } else {
                currentUrlElement.textContent = 'Cannot block this page';
                blockCurrentBtn.disabled = true;
            }
        }
    } catch (error) {
        console.error('Error loading current tab info:', error);
        document.getElementById('current-url').textContent = 'Error loading tab info';
    }
}

// Load blocked sites list
async function loadBlockedSites() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getBlockedSites' });
        
        if (response.success) {
            updateBlockedSitesList(response.sites);
            updateBlockingToggle(response.enabled);
            updateBlockingMethod(response.method);
        }
    } catch (error) {
        console.error('Error loading blocked sites:', error);
        showStatus('Error loading blocked sites', 'error');
    }
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getStatistics' });
        
        if (response.success && response.statistics) {
            const stats = response.statistics;
            document.getElementById('total-blocked').textContent = stats.totalBlocked || 0;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load settings
async function loadSettings() {
    try {
        const data = await chrome.storage.local.get(['blockingMethod']);
        const method = data.blockingMethod || 'close';
        document.getElementById('blocking-method').value = method;
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Update blocked sites list display
function updateBlockedSitesList(sites) {
    const listContainer = document.getElementById('blocked-sites-list');
    const noSitesMessage = document.getElementById('no-sites-message');
    const blockedCount = document.getElementById('blocked-count');
    const sitesCount = document.getElementById('sites-count');
    
    // Update counts
    blockedCount.textContent = sites.length;
    sitesCount.textContent = sites.length;
    
    if (sites.length === 0) {
        listContainer.innerHTML = '<div class="no-sites-message">No sites blocked yet. Add some above!</div>';
        return;
    }
    
    // Clear existing content
    listContainer.innerHTML = '';
    
    // Add each blocked site
    sites.forEach(site => {
        const siteItem = createBlockedSiteItem(site);
        listContainer.appendChild(siteItem);
    });
}

// Create a blocked site item element
function createBlockedSiteItem(site) {
    const item = document.createElement('div');
    item.className = 'blocked-site-item';
    
    item.innerHTML = `
        <span class="site-name">${escapeHtml(site)}</span>
        <button class="remove-btn" data-site="${escapeHtml(site)}" title="Remove site">×</button>
    `;
    
    // Add remove functionality
    const removeBtn = item.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => removeSite(site, item));
    
    return item;
}

// Update blocking toggle state
function updateBlockingToggle(enabled) {
    const toggle = document.getElementById('blocking-toggle');
    toggle.checked = enabled;
}

// Update blocking method selection
function updateBlockingMethod(method) {
    const select = document.getElementById('blocking-method');
    select.value = method || 'close';
}

// Set up all event listeners
function setupEventListeners() {
    // Add site button
    document.getElementById('add-site-btn').addEventListener('click', addSite);
    
    // Add site on Enter key
    document.getElementById('site-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addSite();
        }
    });
    
    // Block current site button
    document.getElementById('block-current-site').addEventListener('click', blockCurrentSite);
    
    // Blocking toggle
    document.getElementById('blocking-toggle').addEventListener('change', toggleBlocking);
    
    // Blocking method change
    document.getElementById('blocking-method').addEventListener('change', updateBlockingMethodSetting);
    
    // Clear all sites button
    document.getElementById('clear-all-btn').addEventListener('click', clearAllSites);
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', exportBlockedSites);
}

// Add a new site to the blocked list
async function addSite() {
    const input = document.getElementById('site-input');
    const site = input.value.trim();
    
    if (!site) {
        showStatus('Please enter a website to block', 'error');
        return;
    }
    
    // Basic validation
    if (!isValidSite(site)) {
        showStatus('Please enter a valid website (e.g., facebook.com)', 'error');
        return;
    }
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'addBlockedSite',
            site: site
        });
        
        if (response.success) {
            input.value = '';
            updateBlockedSitesList(response.sites);
            showStatus(`Added ${site} to blocked list`, 'success');
        } else {
            showStatus(response.error || 'Failed to add site', 'error');
        }
    } catch (error) {
        console.error('Error adding site:', error);
        showStatus('Error adding site', 'error');
    }
}

// Remove a site from the blocked list
async function removeSite(site, itemElement) {
    // Add removing animation
    itemElement.classList.add('removing');
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'removeBlockedSite',
            site: site
        });
        
        if (response.success) {
            // Wait for animation to complete
            setTimeout(() => {
                updateBlockedSitesList(response.sites);
                showStatus(`Removed ${site} from blocked list`, 'success');
            }, 300);
        } else {
            // Remove animation class if failed
            itemElement.classList.remove('removing');
            showStatus(response.error || 'Failed to remove site', 'error');
        }
    } catch (error) {
        console.error('Error removing site:', error);
        itemElement.classList.remove('removing');
        showStatus('Error removing site', 'error');
    }
}

// Block the current site
async function blockCurrentSite() {
    const btn = document.getElementById('block-current-site');
    const domain = btn.dataset.domain;
    
    if (!domain) {
        showStatus('No valid site to block', 'error');
        return;
    }
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'addBlockedSite',
            site: domain
        });
        
        if (response.success) {
            updateBlockedSitesList(response.sites);
            showStatus(`Added ${domain} to blocked list`, 'success');
        } else {
            showStatus(response.error || 'Failed to block current site', 'error');
        }
    } catch (error) {
        console.error('Error blocking current site:', error);
        showStatus('Error blocking current site', 'error');
    }
}

// Toggle blocking on/off
async function toggleBlocking() {
    const toggle = document.getElementById('blocking-toggle');
    const enabled = toggle.checked;
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'toggleBlocking',
            enabled: enabled
        });
        
        if (response.success) {
            showStatus(`Blocking ${enabled ? 'enabled' : 'disabled'}`, 'success');
        } else {
            // Revert toggle if failed
            toggle.checked = !enabled;
            showStatus('Failed to toggle blocking', 'error');
        }
    } catch (error) {
        console.error('Error toggling blocking:', error);
        toggle.checked = !enabled;
        showStatus('Error toggling blocking', 'error');
    }
}

// Update blocking method setting
async function updateBlockingMethodSetting() {
    const select = document.getElementById('blocking-method');
    const method = select.value;
    
    try {
        await chrome.storage.local.set({ blockingMethod: method });
        showStatus(`Blocking method updated to: ${getMethodDisplayName(method)}`, 'success');
    } catch (error) {
        console.error('Error updating blocking method:', error);
        showStatus('Error updating blocking method', 'error');
    }
}

// Clear all blocked sites
async function clearAllSites() {
    if (!confirm('Are you sure you want to remove all blocked sites?')) {
        return;
    }
    
    try {
        // Get current sites and remove them all
        const response = await chrome.runtime.sendMessage({ action: 'getBlockedSites' });
        
        if (response.success && response.sites.length > 0) {
            // Remove all sites
            for (const site of response.sites) {
                await chrome.runtime.sendMessage({
                    action: 'removeBlockedSite',
                    site: site
                });
            }
            
            updateBlockedSitesList([]);
            showStatus('All blocked sites removed', 'success');
        } else {
            showStatus('No sites to remove', 'info');
        }
    } catch (error) {
        console.error('Error clearing all sites:', error);
        showStatus('Error clearing sites', 'error');
    }
}

// Export blocked sites list
async function exportBlockedSites() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getBlockedSites' });
        
        if (response.success && response.sites.length > 0) {
            const exportData = {
                blockedSites: response.sites,
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dontvisit-blocklist-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            showStatus('Blocked sites exported successfully', 'success');
        } else {
            showStatus('No sites to export', 'info');
        }
    } catch (error) {
        console.error('Error exporting sites:', error);
        showStatus('Error exporting sites', 'error');
    }
}

// Utility functions
function isValidSite(site) {
    // Basic validation for website format
    if (!site || site.length < 3) return false;
    
    // Allow wildcards
    if (site.includes('*')) return true;
    
    // Check for basic domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
    
    // Remove protocol if present
    const cleanSite = site.replace(/^https?:\/\//, '').split('/')[0];
    
    return domainRegex.test(cleanSite) || site.includes('.');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getMethodDisplayName(method) {
    const names = {
        'close': 'Close Tab',
        'redirect': 'Redirect to Blocked Page',
        'warning': 'Show Warning'
    };
    return names[method] || method;
}

function showStatus(message, type = 'info') {
    const statusElement = document.getElementById('status-message');
    
    // Clear existing classes
    statusElement.className = 'status-message';
    
    // Add new type class
    statusElement.classList.add(type);
    statusElement.textContent = message;
    
    // Show the message
    statusElement.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        statusElement.classList.remove('show');
    }, 3000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Popup received message:', request);
    
    switch (request.action) {
        case 'updatePopup':
            // Refresh popup data
            loadBlockedSites();
            loadStatistics();
            break;
            
        case 'siteBlocked':
            showStatus(`Blocked: ${request.site}`, 'info');
            loadStatistics();
            break;
    }
    
    sendResponse({ received: true });
});

// Refresh data when popup becomes visible
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadStatistics();
    }
});
