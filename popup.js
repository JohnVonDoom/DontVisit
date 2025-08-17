// Popup script for Edge extension
document.addEventListener('DOMContentLoaded', async () => {
    // Get current tab information
    await getCurrentTabInfo();
    
    // Set up event listeners
    setupEventListeners();
});

async function getCurrentTabInfo() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab) {
            document.getElementById('tab-title').textContent = `Title: ${tab.title}`;
            document.getElementById('tab-url').textContent = `URL: ${tab.url}`;
        }
    } catch (error) {
        console.error('Error getting tab info:', error);
        document.getElementById('tab-title').textContent = 'Error loading tab info';
        document.getElementById('tab-url').textContent = '';
    }
}

function setupEventListeners() {
    // Action button click handler
    document.getElementById('action-btn').addEventListener('click', async () => {
        updateStatus('Button clicked!');
        
        // Example: Send message to content script
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            await chrome.tabs.sendMessage(tab.id, {
                action: 'buttonClicked',
                message: 'Hello from popup!'
            });
            
            updateStatus('Message sent to content script');
        } catch (error) {
            console.error('Error sending message:', error);
            updateStatus('Error sending message');
        }
    });
    
    // Storage test button click handler
    document.getElementById('storage-btn').addEventListener('click', async () => {
        try {
            // Test storage functionality
            const testData = { timestamp: Date.now(), message: 'Test storage data' };
            
            // Save to storage
            await chrome.storage.local.set({ testData });
            
            // Read from storage
            const result = await chrome.storage.local.get(['testData']);
            
            if (result.testData) {
                updateStatus(`Storage test successful: ${result.testData.message}`);
            } else {
                updateStatus('Storage test failed');
            }
        } catch (error) {
            console.error('Storage error:', error);
            updateStatus('Storage error occurred');
        }
    });
}

function updateStatus(message) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    
    // Clear status after 3 seconds
    setTimeout(() => {
        statusElement.textContent = 'Ready';
    }, 3000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updatePopup') {
        updateStatus(request.message);
    }
    
    sendResponse({ received: true });
});
