# 🌐 Microsoft Edge Extension Setup

## Install Chrome Extension in Microsoft Edge

### Step 1: Enable Developer Mode
1. Open Microsoft Edge
2. Go to `edge://extensions/`
3. Turn ON "Developer mode" (toggle in bottom-left)

### Step 2: Load Extension
1. Click "Load unpacked"
2. Navigate to your `chrome-extension` folder
3. Select the folder and click "Select Folder"
4. Extension should appear in your extensions list

### Step 3: Pin Extension
1. Click the puzzle piece icon in Edge toolbar
2. Find "Epitychia AI Clipboard"
3. Click the pin icon to pin it to toolbar

### Step 4: Grant Permissions
1. Click on the extension icon
2. Grant clipboard permissions when prompted
3. Allow the extension to run on all sites

## Test the Extension

### Test 1: Copy from External App
1. Open Notepad or Word
2. Type some text and copy it (Ctrl+C)
3. AI popup should appear in Edge within 500ms

### Test 2: Copy from Another Website
1. Open a new tab in Edge
2. Go to any website (like Google)
3. Copy some text from the page
4. AI popup should appear

### Test 3: Test Transformations
1. Copy text: "hey can u help me write email to boss about project delay"
2. Click "Make Professional" in the popup
3. Transformed text should be copied to clipboard

## Troubleshooting

### Extension Not Appearing
- Make sure Developer mode is enabled
- Try refreshing the extensions page
- Check if the extension folder path is correct

### Popup Not Showing
- Check if extension has clipboard permissions
- Look for errors in Edge DevTools (F12 → Console)
- Try the "Test Popup" button in extension popup

### API Errors
- Make sure your backend is running on localhost:3001
- Check if CORS is properly configured
- Verify the extension can reach your API

## Edge-Specific Features

### Advantage of Edge
- Better integration with Windows clipboard
- More reliable system-wide monitoring
- Better performance on Windows

### Edge Extensions Store
- For production, you can publish to Edge Add-ons store
- Same codebase works for both Chrome and Edge
- Edge has fewer restrictions than Chrome Web Store