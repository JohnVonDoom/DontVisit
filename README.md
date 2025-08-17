# Microsoft Edge Extension Template

A complete base template for creating Microsoft Edge extensions using Manifest V3.

## Files Structure

```
├── manifest.json       # Extension configuration and permissions
├── popup.html         # Extension popup interface
├── popup.css          # Styling for the popup
├── popup.js           # Popup functionality and logic
├── background.js      # Background service worker
├── content.js         # Content script for web page interaction
├── icons/             # Extension icons (16x16, 32x32, 48x48, 128x128)
└── README.md          # This file
```

## Features Included

### 🎯 Core Components
- **Manifest V3** configuration
- **Popup interface** with modern UI
- **Background service worker** for persistent functionality
- **Content script** for web page interaction
- **Storage API** integration
- **Message passing** between components

### 🛠️ Built-in Functionality
- Tab information display
- Local storage testing
- Context menu integration
- Floating button on web pages
- Page change monitoring
- Extension lifecycle management

## Installation & Development

### 1. Load Extension in Edge
1. Open Microsoft Edge
2. Navigate to `edge://extensions/`
3. Enable "Developer mode" (toggle in left sidebar)
4. Click "Load unpacked"
5. Select this extension folder

### 2. Add Icons (Required)
Create the following icon files in the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

### 3. Customize Extension
1. Update `manifest.json` with your extension details
2. Modify the popup interface in `popup.html` and `popup.css`
3. Add your functionality to `popup.js`, `background.js`, and `content.js`

## Key Components Explained

### manifest.json
- Defines extension metadata, permissions, and file references
- Uses Manifest V3 format (latest standard)
- Includes common permissions like `activeTab` and `storage`

### popup.html/css/js
- Creates the extension's popup interface
- Displays current tab information
- Provides buttons for testing functionality
- Handles user interactions

### background.js
- Service worker that runs in the background
- Handles extension lifecycle events
- Manages context menus and alarms
- Facilitates communication between components

### content.js
- Runs on web pages the user visits
- Can modify page content and behavior
- Adds floating button to pages
- Monitors page changes and URL updates

## Permissions Used

- `activeTab`: Access to the currently active tab
- `storage`: Local storage for extension data
- `contextMenus`: Right-click context menu items (optional)
- `alarms`: Scheduled tasks (optional)

## Message Passing

The template includes examples of communication between:
- Popup ↔ Background script
- Popup ↔ Content script
- Background ↔ Content script

## Customization Tips

1. **Update Extension Details**: Modify name, description, and version in `manifest.json`
2. **Add Permissions**: Include additional permissions as needed for your functionality
3. **Styling**: Customize the popup appearance in `popup.css`
4. **Functionality**: Implement your specific features in the respective JavaScript files
5. **Icons**: Replace placeholder icon references with your actual icon files

## Common Use Cases

This template supports development of extensions for:
- Web page content modification
- Data collection and analysis
- User productivity tools
- Page monitoring and notifications
- Custom browser functionality

## Testing

1. Load the extension in Edge developer mode
2. Click the extension icon to test the popup
3. Visit web pages to test content script functionality
4. Check browser console for debug messages
5. Test storage functionality with the provided buttons

## Publishing

When ready to publish:
1. Create proper icon files
2. Update all placeholder content
3. Test thoroughly across different websites
4. Package the extension
5. Submit to Microsoft Edge Add-ons store

## Browser Compatibility

This template is designed for Microsoft Edge but is also compatible with:
- Google Chrome
- Other Chromium-based browsers

The WebExtensions API ensures cross-browser compatibility with minimal modifications.
