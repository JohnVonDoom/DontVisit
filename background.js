// Background service worker for Edge extension
console.log('Background script loaded');

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed/updated:', details.reason);
    
    if (details.reason === 'install') {
        // First time installation
        console.log('Extension installed for the first time');
        
        // Set default storage values
        chrome.storage.local.set({
            extensionSettings: {
                enabled: true,
                version: chrome.runtime.getManifest().version,
                installDate: Date.now()
            }
        });
    } else if (details.reason === 'update') {
        // Extension updated
        console.log('Extension updated from version:', details.previousVersion);
    }
});

// Tab update listener
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only process when the tab is completely loaded
    if (changeInfo.status === 'complete' && tab.url) {
        console.log('Tab updated:', tab.url);
        
        // Example: You can perform actions when specific pages load
        if (tab.url.includes('example.com')) {
            console.log('User visited example.com');
            
            // Send message to content script
            chrome.tabs.sendMessage(tabId, {
                action: 'pageLoaded',
                url: tab.url
            }).catch(error => {
                // Content script might not be ready yet, that's okay
                console.log('Could not send message to content script:', error.message);
            });
        }
    }
});

// Message listener for communication with popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    switch (request.action) {
        case 'getExtensionInfo':
            sendResponse({
                version: chrome.runtime.getManifest().version,
                name: chrome.runtime.getManifest().name
            });
            break;
            
        case 'logActivity':
            console.log('Activity logged:', request.data);
            sendResponse({ logged: true });
            break;
            
        case 'performBackgroundTask':
            // Example background task
            performBackgroundTask(request.data)
                .then(result => sendResponse({ success: true, result }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true; // Keep message channel open for async response
            
        default:
            console.log('Unknown action:', request.action);
            sendResponse({ error: 'Unknown action' });
    }
});

// Example background task function
async function performBackgroundTask(data) {
    console.log('Performing background task with data:', data);
    
    // Simulate some async work
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { processed: true, timestamp: Date.now() };
}

// Context menu creation (optional)
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'myExtensionAction',
        title: 'My Extension Action',
        contexts: ['page', 'selection']
    });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'myExtensionAction') {
        console.log('Context menu clicked on:', info.pageUrl);
        
        // Send message to content script
        chrome.tabs.sendMessage(tab.id, {
            action: 'contextMenuClicked',
            selectionText: info.selectionText,
            pageUrl: info.pageUrl
        }).catch(error => {
            console.log('Could not send context menu message:', error.message);
        });
    }
});

// Alarm listener (for scheduled tasks)
chrome.alarms.onAlarm.addListener((alarm) => {
    console.log('Alarm triggered:', alarm.name);
    
    if (alarm.name === 'dailyTask') {
        // Perform daily maintenance task
        performDailyMaintenance();
    }
});

// Set up a daily alarm (optional)
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('dailyTask', {
        delayInMinutes: 1440, // 24 hours
        periodInMinutes: 1440
    });
});

async function performDailyMaintenance() {
    console.log('Performing daily maintenance');
    
    // Example: Clean up old storage data
    try {
        const result = await chrome.storage.local.get(null);
        console.log('Current storage size:', Object.keys(result).length);
        
        // Add your maintenance logic here
    } catch (error) {
        console.error('Error during daily maintenance:', error);
    }
}
