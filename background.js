// Background service worker for DontVisit Website Blocker
console.log('DontVisit background script loaded');

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed/updated:', details.reason);
    
    if (details.reason === 'install') {
        // First time installation - set default values
        console.log('DontVisit installed for the first time');
        
        chrome.storage.local.set({
            blockedSites: [],
            blockingEnabled: true,
            blockingMethod: 'close', // 'close', 'redirect', 'warning'
            statistics: {
                totalBlocked: 0,
                sitesBlocked: {},
                installDate: Date.now()
            },
            settings: {
                blockSubdomains: true,
                caseSensitive: false,
                showNotifications: true
            }
        });
    }
});

// Tab update listener - main blocking logic
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only process when the tab is loading or complete and has a URL
    if ((changeInfo.status === 'loading' || changeInfo.status === 'complete') && tab.url) {
        await checkAndBlockSite(tabId, tab.url);
    }
});

// Tab creation listener - check new tabs
chrome.tabs.onCreated.addListener(async (tab) => {
    if (tab.url) {
        await checkAndBlockSite(tab.id, tab.url);
    }
});

// Main blocking function
async function checkAndBlockSite(tabId, url) {
    try {
        // Get blocking settings and blocked sites
        const data = await chrome.storage.local.get([
            'blockedSites', 
            'blockingEnabled', 
            'blockingMethod', 
            'settings',
            'statistics'
        ]);
        
        // Skip if blocking is disabled
        if (!data.blockingEnabled) {
            return;
        }
        
        const blockedSites = data.blockedSites || [];
        const blockingMethod = data.blockingMethod || 'close';
        const settings = data.settings || {};
        
        // Check if current URL should be blocked
        const shouldBlock = isUrlBlocked(url, blockedSites, settings);
        
        if (shouldBlock) {
            console.log('Blocking site:', url);
            
            // Update statistics
            await updateBlockingStatistics(url, data.statistics);
            
            // Apply blocking method
            await applyBlockingMethod(tabId, url, blockingMethod);
            
            // Show notification if enabled
            if (settings.showNotifications) {
                showBlockingNotification(url);
            }
        }
    } catch (error) {
        console.error('Error in checkAndBlockSite:', error);
    }
}

// Check if URL should be blocked
function isUrlBlocked(url, blockedSites, settings) {
    if (!url || !blockedSites || blockedSites.length === 0) {
        return false;
    }
    
    // Skip chrome:// and extension:// URLs
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://')) {
        return false;
    }
    
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        const fullUrl = url.toLowerCase();
        
        return blockedSites.some(blockedSite => {
            if (!blockedSite || typeof blockedSite !== 'string') {
                return false;
            }
            
            const blocked = blockedSite.toLowerCase().trim();
            
            // Skip empty entries
            if (!blocked) {
                return false;
            }
            
            // Exact URL match
            if (!settings.caseSensitive && fullUrl.includes(blocked)) {
                return true;
            }
            
            // Domain matching
            if (hostname === blocked) {
                return true;
            }
            
            // Subdomain matching (if enabled)
            if (settings.blockSubdomains && hostname.endsWith('.' + blocked)) {
                return true;
            }
            
            // Wildcard matching (basic)
            if (blocked.includes('*')) {
                const regex = new RegExp(blocked.replace(/\*/g, '.*'));
                return regex.test(hostname) || regex.test(fullUrl);
            }
            
            return false;
        });
    } catch (error) {
        console.error('Error parsing URL:', url, error);
        return false;
    }
}

// Apply the selected blocking method
async function applyBlockingMethod(tabId, url, method) {
    try {
        switch (method) {
            case 'close':
                await chrome.tabs.remove(tabId);
                break;
                
            case 'redirect':
                await chrome.tabs.update(tabId, {
                    url: chrome.runtime.getURL('blocked.html') + '?blocked=' + encodeURIComponent(url)
                });
                break;
                
            case 'warning':
                // Send message to content script to show warning
                await chrome.tabs.sendMessage(tabId, {
                    action: 'showBlockingWarning',
                    blockedUrl: url
                }).catch(() => {
                    // If content script not ready, fall back to redirect
                    chrome.tabs.update(tabId, {
                        url: chrome.runtime.getURL('blocked.html') + '?blocked=' + encodeURIComponent(url)
                    });
                });
                break;
                
            default:
                await chrome.tabs.remove(tabId);
        }
    } catch (error) {
        console.error('Error applying blocking method:', error);
    }
}

// Update blocking statistics
async function updateBlockingStatistics(url, currentStats) {
    try {
        const stats = currentStats || {
            totalBlocked: 0,
            sitesBlocked: {},
            installDate: Date.now()
        };
        
        stats.totalBlocked = (stats.totalBlocked || 0) + 1;
        
        // Extract domain for statistics
        const domain = new URL(url).hostname;
        stats.sitesBlocked[domain] = (stats.sitesBlocked[domain] || 0) + 1;
        
        await chrome.storage.local.set({ statistics: stats });
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

// Show blocking notification
function showBlockingNotification(url) {
    try {
        const domain = new URL(url).hostname;
        
        // Create a simple notification (you can enhance this)
        console.log(`🚫 Blocked: ${domain}`);
        
        // You could use chrome.notifications API here if you add the permission
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// Message listener for communication with popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    switch (request.action) {
        case 'addBlockedSite':
            addBlockedSite(request.site)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
            
        case 'removeBlockedSite':
            removeBlockedSite(request.site)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
            
        case 'getBlockedSites':
            getBlockedSites()
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
            
        case 'toggleBlocking':
            toggleBlocking(request.enabled)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
            
        case 'getStatistics':
            getStatistics()
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
            
        case 'getCurrentTabInfo':
            getCurrentTabInfo()
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
            
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
});

// Helper functions for popup communication
async function addBlockedSite(site) {
    const data = await chrome.storage.local.get(['blockedSites']);
    const blockedSites = data.blockedSites || [];
    
    if (!blockedSites.includes(site)) {
        blockedSites.push(site);
        await chrome.storage.local.set({ blockedSites });
        return { success: true, sites: blockedSites };
    }
    
    return { success: false, error: 'Site already blocked' };
}

async function removeBlockedSite(site) {
    const data = await chrome.storage.local.get(['blockedSites']);
    const blockedSites = data.blockedSites || [];
    const index = blockedSites.indexOf(site);
    
    if (index > -1) {
        blockedSites.splice(index, 1);
        await chrome.storage.local.set({ blockedSites });
        return { success: true, sites: blockedSites };
    }
    
    return { success: false, error: 'Site not found in blocked list' };
}

async function getBlockedSites() {
    const data = await chrome.storage.local.get(['blockedSites', 'blockingEnabled', 'blockingMethod']);
    return {
        success: true,
        sites: data.blockedSites || [],
        enabled: data.blockingEnabled !== false,
        method: data.blockingMethod || 'close'
    };
}

async function toggleBlocking(enabled) {
    await chrome.storage.local.set({ blockingEnabled: enabled });
    return { success: true, enabled };
}

async function getStatistics() {
    const data = await chrome.storage.local.get(['statistics']);
    return { success: true, statistics: data.statistics || {} };
}

async function getCurrentTabInfo() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return {
            success: true,
            tab: {
                url: tab.url,
                title: tab.title,
                id: tab.id
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
