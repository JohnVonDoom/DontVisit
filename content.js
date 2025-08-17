// Content script for DontVisit Website Blocker
console.log('DontVisit content script loaded on:', window.location.href);

// Initialize content script
(function() {
    'use strict';
    
    // Flag to prevent multiple initializations
    if (window.dontVisitContentLoaded) {
        return;
    }
    window.dontVisitContentLoaded = true;
    
    // Initialize the content script
    init();
})();

function init() {
    console.log('Initializing DontVisit content script');
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // Notify background script that content script is ready
    chrome.runtime.sendMessage({
        action: 'contentScriptReady',
        url: window.location.href
    }).catch(error => {
        console.log('Could not send ready message:', error.message);
    });
}

function handleMessage(request, sender, sendResponse) {
    console.log('DontVisit content script received message:', request);
    
    switch (request.action) {
        case 'showBlockingWarning':
            showBlockingWarning(request.blockedUrl);
            sendResponse({ handled: true });
            break;
            
        case 'hideBlockingWarning':
            hideBlockingWarning();
            sendResponse({ handled: true });
            break;
            
        default:
            console.log('Unknown action in content script:', request.action);
            sendResponse({ error: 'Unknown action' });
    }
}

function showBlockingWarning(blockedUrl) {
    // Remove any existing warning
    hideBlockingWarning();
    
    // Create warning overlay
    const overlay = document.createElement('div');
    overlay.id = 'dontvisit-warning-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        animation: dontvisit-fadeIn 0.3s ease-out;
    `;
    
    // Create warning modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: dontvisit-slideIn 0.3s ease-out;
    `;
    
    const domain = new URL(blockedUrl).hostname;
    
    modal.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
        <h1 style="color: #dc3545; margin-bottom: 16px; font-size: 28px; font-weight: 600;">
            Website Blocked
        </h1>
        <div style="background: #f8f9fa; padding: 12px 16px; border-radius: 6px; margin: 20px 0; font-family: 'Courier New', monospace; font-size: 14px; color: #6c757d; border: 1px solid #e9ecef; word-break: break-all;">
            ${escapeHtml(domain)}
        </div>
        <p style="color: #6c757d; margin-bottom: 30px; line-height: 1.6;">
            This website is on your blocked list. Are you sure you want to continue?
        </p>
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 16px; margin: 20px 0; color: #856404;">
            <strong style="display: block; margin-bottom: 8px;">🎯 Stay Focused!</strong>
            Remember why you blocked this site. Consider working on your important tasks instead.
        </div>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button id="dontvisit-go-back" style="padding: 12px 24px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; background-color: #28a745; color: white; transition: all 0.2s ease;">
                ← Go Back
            </button>
            <button id="dontvisit-proceed" style="padding: 12px 24px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; background-color: #dc3545; color: white; transition: all 0.2s ease;">
                Continue Anyway
            </button>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #6c757d;">
            <a href="#" id="dontvisit-manage-blocks" style="color: #007bff; text-decoration: none;">
                Manage blocked sites
            </a>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add event listeners
    document.getElementById('dontvisit-go-back').addEventListener('click', () => {
        hideBlockingWarning();
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'about:blank';
        }
    });
    
    document.getElementById('dontvisit-proceed').addEventListener('click', () => {
        hideBlockingWarning();
        // Allow the page to continue loading
        chrome.runtime.sendMessage({
            action: 'logActivity',
            data: {
                type: 'warningOverridden',
                url: blockedUrl,
                timestamp: Date.now()
            }
        }).catch(() => {});
    });
    
    document.getElementById('dontvisit-manage-blocks').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Click the DontVisit extension icon in your browser toolbar to manage blocked sites.');
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            hideBlockingWarning();
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'about:blank';
            }
        }
    });
    
    // Add CSS animations
    if (!document.getElementById('dontvisit-styles')) {
        const styles = document.createElement('style');
        styles.id = 'dontvisit-styles';
        styles.textContent = `
            @keyframes dontvisit-fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes dontvisit-slideIn {
                from { 
                    opacity: 0; 
                    transform: translateY(-20px) scale(0.95); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0) scale(1); 
                }
            }
            
            #dontvisit-warning-overlay button:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            #dontvisit-go-back:hover {
                background-color: #218838 !important;
            }
            
            #dontvisit-proceed:hover {
                background-color: #c82333 !important;
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Log the warning display
    chrome.runtime.sendMessage({
        action: 'logActivity',
        data: {
            type: 'warningShown',
            url: blockedUrl,
            timestamp: Date.now()
        }
    }).catch(() => {});
}

function hideBlockingWarning() {
    const overlay = document.getElementById('dontvisit-warning-overlay');
    if (overlay) {
        overlay.style.animation = 'dontvisit-fadeIn 0.2s ease-out reverse';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 200);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, could be switching tabs
        console.log('DontVisit: Page hidden');
    } else {
        // Page is visible again
        console.log('DontVisit: Page visible');
    }
});

// Monitor for dynamic navigation (SPAs)
let currentUrl = window.location.href;
const urlCheckInterval = setInterval(() => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        console.log('DontVisit: URL changed to:', currentUrl);
        
        // Notify background script of URL change
        chrome.runtime.sendMessage({
            action: 'urlChanged',
            newUrl: currentUrl
        }).catch(error => {
            console.log('Could not send URL change message:', error.message);
        });
    }
}, 1000);

// Clean up interval when page unloads
window.addEventListener('beforeunload', () => {
    clearInterval(urlCheckInterval);
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key to close warning
    if (e.key === 'Escape' && document.getElementById('dontvisit-warning-overlay')) {
        hideBlockingWarning();
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'about:blank';
        }
    }
});

console.log('DontVisit content script initialization complete');
