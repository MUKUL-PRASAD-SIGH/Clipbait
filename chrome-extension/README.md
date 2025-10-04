# Epitychia Chrome Extension

The Epitychia Chrome Extension seamlessly integrates with your browser to capture, manage, and enhance your clipboard experience with AI-powered features.

## Features

- **Instant AI Transformations**: Copy text anywhere and get AI-powered suggestions instantly
- **Smart Clipboard Management**: Automatic clipboard history with cross-device sync
- **Quick Access Popup**: View and manage clipboard items directly from your browser
- **AI-Powered Actions**: Summarize, rewrite, translate, and transform text on-the-fly
- **Collections Support**: Organize clipboard items into themed collections
- **Cross-Device Sync**: Access your clipboard history across all devices

## Installation

### Step 1: Enable Developer Mode

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Toggle "Developer mode" ON (switch in the top-right corner)

### Step 2: Load the Extension

1. Click "Load unpacked" button
2. Navigate to and select the `chrome-extension` folder from your Epitychia project
3. The extension will appear in your extensions list

### Step 3: Pin the Extension (Recommended)

1. Click the puzzle piece icon (🧩) in Chrome's toolbar
2. Find "Epitychia" in the list
3. Click the pin icon to keep it visible in your toolbar

## How It Works

### Instant AI Transformations

1. **Copy any text** (Ctrl+C) on any webpage
2. **AI popup appears** automatically with transformation options
3. **Click any option** to transform and copy the result instantly

### Available AI Transformations

- 📝 **Summarize** - Create concise summaries of long text
- 💼 **Professional** - Convert to professional business tone
- ✏️ **Fix Grammar** - Correct grammar and spelling errors
- 📧 **Email Draft** - Generate professional email format
- ✅ **Task List** - Convert text into actionable task items
- 💡 **Expand Ideas** - Elaborate and expand on concepts
- 🌐 **Translate** - Translate to different languages
- 📊 **Format** - Convert to different text formats

### Clipboard Management

- **Automatic capture**: All copied text is automatically saved
- **History access**: Click extension icon to view recent items
- **Quick paste**: Click any item to copy it back to clipboard
- **Search & filter**: Find specific clipboard items quickly

## Setup & Configuration

### Prerequisites

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **Chrome browser** with developer mode enabled
- **Docker** (optional, for database) - [Download here](https://docker.com/)
- **Git** - [Download here](https://git-scm.com/)

### Backend Setup Options

#### Option 1: Quick Start (In-Memory Storage)

```bash
# Clone the project
git clone <your-repo-url>
cd epitychia

# Install dependencies
npm install

# Start backend with in-memory storage
cd backend
npm run dev
```

#### Option 2: Full Setup with Database (Docker)

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Configure environment
cd backend
cp .env.example .env
# Edit .env file with your configuration

# Start backend
npm run dev
```

### Required Configuration Files

#### Backend Environment (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database (set to true for in-memory storage)
SKIP_DATABASE=true

# Security
JWT_SECRET=your-secret-key-here

# Firebase Configuration (for authentication)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# AI Services (optional - uses fallback if not configured)
HUGGINGFACE_API_KEY=your-huggingface-key-here
USE_HUGGINGFACE=true
```

### Firebase Setup (Required for Authentication)

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard

2. **Enable Authentication**:
   - In Firebase Console, go to Authentication
   - Click "Get started"
   - Enable Email/Password and Google sign-in methods

3. **Get Configuration**:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click "Web app" icon and register your app
   - Copy the configuration values to your `.env` file

### Hugging Face AI Setup (Optional)

The extension works with fallback AI transformations, but for enhanced AI features:

1. **Get API Key** (Free):
   - Go to [Hugging Face](https://huggingface.co/)
   - Create account and go to Settings → Access Tokens
   - Create a new token with "Read" permissions

2. **Configure Backend**:
   ```env
   HUGGINGFACE_API_KEY=hf_your_token_here
   USE_HUGGINGFACE=true
   ```

3. **Available Models** (Free tier):
   - Text summarization: `facebook/bart-large-cnn`
   - Text generation: `microsoft/DialoGPT-medium`
   - Grammar correction: Built-in fallback methods

### Docker Setup (Optional)

For full database functionality:

```bash
# Start all services with Docker
docker-compose up -d

# Or start individual services
docker-compose up -d postgres redis
```

Services included:
- **PostgreSQL**: Database for persistent storage
- **Redis**: Caching and session management
- **Backend API**: Node.js server with full features

### First Time Setup

1. Complete backend setup (choose Option 1 or 2 above)
2. Configure Firebase for authentication (required)
3. Optionally set up Hugging Face for enhanced AI features
4. Start the backend server (`npm run dev` in backend folder)
5. Install the Chrome extension (see Installation section)
6. Click the extension icon and create your account
7. Start copying text to see AI transformations and clipboard history

## Usage Guide

### Basic Clipboard Operations

- **Copy text**: Use Ctrl+C (Windows) or Cmd+C (Mac) anywhere
- **View history**: Click the Epitychia extension icon
- **Quick paste**: Click any item in the popup to copy it
- **Clear history**: Use the clear button in the popup

### AI Transformations

- **Instant popup**: Appears automatically when you copy text
- **Choose transformation**: Click on any AI action button
- **Result copied**: Transformed text is automatically copied to clipboard
- **Manual access**: Use the extension popup for additional AI features

### Collections Management

- **Create collections**: Group related clipboard items
- **Quick access**: Filter popup view by collection
- **Organize content**: Drag and drop items between collections

## Troubleshooting

### Extension Not Loading

- **Check permissions**: Ensure extension has necessary permissions
- **Reload extension**: Go to `chrome://extensions/` and click reload
- **Clear cache**: Disable and re-enable the extension

### AI Popup Not Appearing

- **Backend connection**: Ensure `http://localhost:3000` is accessible
- **Check console**: Open DevTools (F12) and check for errors
- **Permissions**: Verify clipboard access permissions

### Connection Issues

- **Backend not running**: Start the Epitychia backend server
- **Port conflicts**: Ensure port 3000 is available
- **Firewall**: Check if firewall is blocking localhost connections
- **CORS issues**: Backend should allow extension origin

### Performance Issues

- **Clear history**: Remove old clipboard items
- **Restart extension**: Reload the extension
- **Browser restart**: Close and reopen Chrome

## Privacy & Security

- **Local processing**: AI transformations happen on your local backend
- **No external tracking**: Extension doesn't send data to third parties
- **Secure storage**: Clipboard data is stored securely locally
- **User control**: You control what gets saved and processed

## Development

### File Structure

```
chrome-extension/
├── manifest.json      # Extension configuration and permissions
├── background.js      # Service worker for clipboard monitoring
├── content.js         # Content script for web page interaction
├── popup.html         # Extension popup interface
├── popup.js           # Popup functionality and API calls
├── popup.css          # Popup styling and layout
└── README.md          # This documentation
```

### API Endpoints

The extension communicates with these backend endpoints:

- **Clipboard**: `POST /api/clipboard` - Save clipboard items
- **History**: `GET /api/clipboard` - Retrieve clipboard history
- **AI Transform**: `POST /api/generative/transform` - AI text transformations
- **Collections**: `GET/POST /api/collections` - Manage collections

### Local Development

1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click the reload button for Epitychia extension
4. Test your changes in the browser

## Support

### Common Solutions

1. **Restart everything**: Backend server, extension, and browser
2. **Check console**: Look for error messages in browser DevTools
3. **Verify setup**: Ensure all prerequisites are met
4. **Clear data**: Reset extension data if issues persist

### Getting Help

- Check the main Epitychia documentation in the project root
- Verify backend server is running and accessible
- Ensure all dependencies are properly installed
- Review browser console for detailed error messages

---

**Note**: This extension requires the Epitychia backend server to be running locally. Make sure to start the full Epitychia application before using the extension.
