# Stay Away! - Website Blocker Extension

A powerful and user-friendly browser extension that helps you stay focused and productive by blocking distracting websites.

## Features

### 🚫 Website Blocking
- **Multiple Blocking Methods**: Choose between closing tabs, redirecting to a blocked page, or showing a warning
- **Smart Pattern Matching**: Support for exact domains, subdomains, and wildcard patterns
- **Real-time Blocking**: Instantly blocks sites as you navigate

### 🎯 User-Friendly Interface
- **Clean Popup Design**: Modern, intuitive interface for managing blocked sites
- **Current Site Blocking**: Quickly block the site you're currently viewing
- **Easy Management**: Add, remove, and view all blocked sites in one place
- **Toggle Control**: Easily enable/disable blocking with a simple switch

### 📊 Statistics & Insights
- **Blocking Statistics**: Track how many sites you've blocked over time
- **Productivity Insights**: See your progress in staying focused
- **Export Functionality**: Backup and share your blocked sites list

### ⚙️ Flexible Settings
- **Blocking Methods**:
  - **Close Tab**: Immediately closes the tab when a blocked site is accessed
  - **Redirect**: Shows a motivational blocked page with productivity tips
  - **Warning**: Displays a warning overlay with option to proceed or go back
- **Pattern Support**: Block entire domains, specific pages, or use wildcards
- **Subdomain Control**: Choose whether to block subdomains automatically

## Installation

1. Download or clone this repository
2. Open your browser's extension management page:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The Stay Away! extension icon will appear in your browser toolbar

## Usage

### Adding Blocked Sites

1. **From the popup**:
   - Click the Stay Away! extension icon
   - Enter a website in the "Add Website to Block" field
   - Click "Add" or press Enter

2. **Block current site**:
   - Navigate to the site you want to block
   - Click the Stay Away! extension icon
   - Click "Block This Site"

### Managing Blocked Sites

- **View all blocked sites**: Open the extension popup to see your complete list
- **Remove sites**: Click the "×" button next to any site in the list
- **Clear all**: Use the "Clear All Sites" button to remove all blocked sites
- **Export list**: Click "Export List" to download your blocked sites as a JSON file

### Blocking Methods

Choose your preferred blocking method in the Settings section:

- **Close Tab**: Blocked tabs are immediately closed (most restrictive)
- **Redirect to Blocked Page**: Shows a motivational page with productivity tips
- **Show Warning**: Displays a warning with option to proceed (least restrictive)

### Pattern Examples

- `facebook.com` - Blocks Facebook
- `*.reddit.com` - Blocks all Reddit subdomains
- `youtube.com/watch` - Blocks YouTube videos but allows the main page
- `twitter.com` - Blocks Twitter/X

## File Structure

```
Stay Away!/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker (main blocking logic)
├── popup.html            # Extension popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── content.js            # Content script (warning overlays)
├── blocked.html          # Blocked page template
├── README.md             # This file
└── icons/                # Extension icons
    ├── favicon-16x16.png
    └── favicon-32x32.png
```

## Technical Details

### Architecture

- **Manifest V3**: Uses the latest extension manifest version
- **Service Worker**: Background script handles URL monitoring and blocking
- **Content Scripts**: Inject warning overlays and handle user interactions
- **Storage API**: Persistent storage for blocked sites and settings
- **Tabs API**: Monitor and control browser tabs

### Permissions

- `activeTab`: Access current tab information
- `storage`: Store blocked sites and settings
- `tabs`: Monitor tab changes and apply blocking

### Browser Compatibility

- ✅ Google Chrome (Manifest V3)
- ✅ Microsoft Edge (Manifest V3)
- ✅ Other Chromium-based browsers

## Development

### Local Development

1. Clone the repository
2. Make your changes
3. Reload the extension in your browser's extension management page
4. Test your changes

### Key Components

- **Background Script** (`background.js`): Core blocking logic, URL monitoring
- **Popup Interface** (`popup.js`): User interface for managing blocked sites
- **Content Script** (`content.js`): Warning overlays and page interactions
- **Blocked Page** (`blocked.html`): Motivational page shown for redirected sites

## Privacy

Stay Away! respects your privacy:
- ✅ All data is stored locally on your device
- ✅ No data is sent to external servers
- ✅ No tracking or analytics
- ✅ Open source code for transparency

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Feature Ideas

- Time-based blocking (block sites during work hours)
- Password protection for settings
- Whitelist mode (allow only specific sites)
- Focus sessions with timers
- Integration with productivity apps

## License

This project is open source. Feel free to use, modify, and distribute as needed.

## Support

If you encounter any issues or have questions:
1. Check the browser's extension console for error messages
2. Try disabling and re-enabling the extension
3. Reload the extension after making changes
4. Create an issue in the repository for bugs or feature requests

---

**Stay focused, stay productive! 🎯**
