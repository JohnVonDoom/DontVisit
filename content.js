// Content script for Edge extension
console.log('Content script loaded on:', window.location.href);

// Initialize content script
(function() {
    'use strict';
    
    // Flag to prevent multiple initializations
    if (window.myExtensionContentLoaded) {
        return;
    }
    window.myExtensionContentLoaded = true;
    
    // Initialize the content script
    init();
})();

function init() {
    console.log('Initializing content script');
    
    // Listen for messages from popup and background scripts
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // Example: Add a floating button to the page
    createFloatingButton();
    
    // Example: Monitor page changes
    observePageChanges();
    
    // Notify background script that content script is ready
    chrome.runtime.sendMessage({
        action: 'contentScriptReady',
        url: window.location.href
    }).catch(error => {
        console.log('Could not send ready message:', error.message);
    });
}

function handleMessage(request, sender, sendResponse) {
    console.log('Content script received message:', request);
    
    switch (request.action) {
        case 'buttonClicked':
            showNotification(request.message);
            sendResponse({ received: true });
            break;
            
        case 'pageLoaded':
            console.log('Background notified page loaded:', request.url);
            sendResponse({ acknowledged: true });
            break;
            
        case 'contextMenuClicked':
            handleContextMenuClick(request);
            sendResponse({ handled: true });
            break;
            
        case 'highlightText':
            highlightText(request.text);
            sendResponse({ highlighted: true });
            break;
            
        default:
            console.log('Unknown action in content script:', request.action);
            sendResponse({ error: 'Unknown action' });
    }
}

function createFloatingButton() {
    // Create a floating button (optional feature)
    const button = document.createElement('div');
    button.id = 'my-extension-floating-btn';
    button.innerHTML = '🔧';
    button.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background-color: #0078d4;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10000;
        font-size: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s;
    `;
    
    button.addEventListener('click', () => {
        showNotification('Floating button clicked!');
        
        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'logActivity',
            data: {
                type: 'floatingButtonClick',
                url: window.location.href,
                timestamp: Date.now()
            }
        });
    });
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(button);
}

function showNotification(message) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #333;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 10001;
        font-family: Arial, sans-serif;
        font-size: 14px;
        max-width: 300px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function handleContextMenuClick(request) {
    console.log('Context menu clicked:', request);
    
    if (request.selectionText) {
        showNotification(`Selected text: "${request.selectionText}"`);
    } else {
        showNotification('Context menu clicked on page');
    }
}

function highlightText(text) {
    if (!text) return;
    
    // Simple text highlighting function
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        if (node.textContent.toLowerCase().includes(text.toLowerCase())) {
            textNodes.push(node);
        }
    }
    
    textNodes.forEach(textNode => {
        const parent = textNode.parentNode;
        const text = textNode.textContent;
        const regex = new RegExp(`(${escapeRegExp(text)})`, 'gi');
        
        if (regex.test(text)) {
            const highlightedHTML = text.replace(regex, '<mark style="background-color: yellow;">$1</mark>');
            const wrapper = document.createElement('span');
            wrapper.innerHTML = highlightedHTML;
            parent.replaceChild(wrapper, textNode);
        }
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function observePageChanges() {
    // Monitor DOM changes (useful for SPAs)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // New content added to page
                console.log('Page content changed');
                
                // You can add logic here to handle dynamic content
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Example: Listen for specific page events
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded in content script');
});

window.addEventListener('load', () => {
    console.log('Page fully loaded in content script');
});

// Example: Detect if page is an SPA and URL changes
let currentUrl = window.location.href;
setInterval(() => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        console.log('URL changed to:', currentUrl);
        
        // Notify background script of URL change
        chrome.runtime.sendMessage({
            action: 'urlChanged',
            newUrl: currentUrl
        }).catch(error => {
            console.log('Could not send URL change message:', error.message);
        });
    }
}, 1000);
