# 🚀 Epitychia Chrome Extension

## Installation Instructions

### 1. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. Extension should appear in your extensions list

### 2. Grant Permissions
- The extension will request clipboard permissions
- Click "Allow" when prompted
- Pin the extension to your toolbar for easy access

### 3. Test the Extension
1. Copy any text from anywhere (Word, Notepad, another website)
2. AI popup should appear in top-right corner within 500ms
3. Click any transformation button to see AI magic
4. Transformed content gets copied back to clipboard

## How It Works

### Background Script (`background.js`)
- Monitors system clipboard every 500ms
- Detects when clipboard content changes
- Notifies all open tabs about clipboard changes
- Handles API calls to your backend

### Content Script (`content.js`)
- Runs on every webpage
- Receives clipboard change notifications
- Shows AI popup with transformation options
- Handles user interactions and API calls

### Popup (`popup.html/js`)
- Extension toolbar popup
- Shows recent clipboard activity
- Provides test functionality
- Links to main web app

## Features

### ✅ System-Wide Clipboard Monitoring
- Works across all applications (not just browser)
- Detects clipboard changes from Word, Notepad, Slack, etc.
- No need to have browser focused

### ✅ Smart Content Detection
- Ignores likely passwords and sensitive data
- Skips very short content
- Only shows popup for meaningful text

### ✅ AI Transformations
- Summarize to bullet points
- Make text professional
- Fix grammar and spelling
- Generate emails
- Create task lists
- Translate content

### ✅ Seamless Integration
- Popup appears on any website
- Transformed content auto-copies to clipboard
- Works with your existing backend API
- Fallback options when backend is offline

## Configuration

### Backend Integration
The extension connects to your backend at:
- `http://localhost:3001/api/generative/suggestions`
- `http://localhost:3001/api/generative/{transformation}`

Make sure your backend is running for full functionality.

### Customization
Edit these files to customize:
- `popup.css` - Popup styling and animations
- `background.js` - Monitoring frequency and API endpoints
- `content.js` - Popup behavior and transformations

## Troubleshooting

### Popup Not Appearing
1. Check if extension is enabled in `chrome://extensions/`
2. Verify clipboard permissions are granted
3. Check browser console for errors (F12 → Console)
4. Try the "Test Popup" button in extension popup

### API Errors
1. Ensure backend is running on `localhost:3001`
2. Check CORS settings in your backend
3. Verify API endpoints are working
4. Extension will show fallback options if backend is down

### Performance Issues
1. Extension monitors clipboard every 500ms
2. Adjust interval in `background.js` if needed
3. Popup auto-hides after 10 seconds
4. Only processes meaningful text content

## Development

### Testing Changes
1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click refresh icon on Epitychia extension
4. Test functionality

### Debugging
1. Background script: `chrome://extensions/` → Inspect views → background page
2. Content script: F12 on any webpage → Console
3. Popup: Right-click extension icon → Inspect popup

## Next Steps

### Production Deployment
1. Create proper icons (16x16, 48x48, 128x128)
2. Update manifest.json with production API URLs
3. Add error handling and analytics
4. Submit to Chrome Web Store

### Enhanced Features
1. User preferences and settings
2. Custom transformation templates
3. Keyboard shortcuts
4. Integration with other productivity tools

## Security Notes

- Extension only reads clipboard when content changes
- Sensitive content detection prevents password leaks
- All API calls go through your secure backend
- No data stored locally except recent clipboard item
- Full transparency in code - no hidden functionality