# 🎯 Epitychia - AI-Powered Smart Clipboard

**Epitychia** is an intelligent clipboard management system that automatically captures your copied text and provides AI-powered transformations like summarization, grammar fixes, professional rewrites, and more. Available as both a desktop app and Chrome extension.

## ✨ Key Features

- **Smart Clipboard Monitoring** - Automatically captures and stores everything you copy
- **AI Text Transformations** - Instantly improve, summarize, or rewrite your text with AI
- **Cross-Platform Sync** - Access your clipboard history across desktop and browser
- **Instant AI Popup** - Get AI suggestions the moment you copy text in your browser
- **Secure Storage** - All your data is stored locally with optional cloud sync

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, make sure you have these installed on your computer:

1. **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
2. **Git** - [Download here](https://git-scm.com/)
3. **Google Chrome** browser

### Step 1: Download the Project

```bash
# Clone the repository
git clone <your-repository-url>
cd epitychia

# Install dependencies
npm install
```

### Step 2: Set Up the Backend

```bash
# Navigate to backend folder
cd backend

# Install backend dependencies
npm install

# Create environment file
copy .env.example .env

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:3000`

### Step 3: Set Up the Desktop App

Open a new terminal window:

```bash
# Navigate to desktop folder
cd desktop

# Install desktop dependencies
npm install

# Start the desktop app
npm run tauri dev
```

The desktop app will open automatically.

### Step 4: Install the Chrome Extension

1. Open Google Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder from this project
6. The Epitychia extension icon should appear in your browser toolbar

### Step 5: Create Your Account

1. Click the Epitychia extension icon in Chrome
2. Click "Register" to create a new account
3. Enter your email and password
4. You're ready to go!

## 🎮 How to Use

### Desktop App
- **View Clipboard History** - See everything you've copied
- **Search & Filter** - Find specific clips quickly  
- **AI Transformations** - Select text and choose an AI action
- **Collections** - Organize clips into custom folders
- **Sync Settings** - Configure cross-device synchronization

### Chrome Extension
- **Automatic Capture** - Just copy text normally (Ctrl+C)
- **Instant AI Popup** - AI suggestions appear automatically when you copy text
- **Quick Actions** - Click any suggestion to transform your text
- **Manual Capture** - Click the extension icon → "Capture Current Clipboard"
- **View History** - Click the extension icon → "View History"

### AI Transformations Available
- 📝 **Summarize** - Create concise summaries
- 💼 **Make Professional** - Convert casual text to professional tone
- ✏️ **Fix Grammar** - Correct grammar and spelling errors
- 📧 **Generate Email** - Turn notes into proper email format
- ✅ **Create Tasks** - Convert text into actionable task lists
- 💡 **Expand Ideas** - Elaborate on concepts and ideas

## 🔧 Configuration

### Backend Configuration (backend/.env)
```env
# Server settings
PORT=3000
NODE_ENV=development

# Database (uses in-memory storage by default)
SKIP_DATABASE=true

# Security
JWT_SECRET=your-secret-key-here

# AI Service (optional - uses fallback transformations if not configured)
HUGGINGFACE_API_KEY=your-huggingface-key-here
USE_HUGGINGFACE=true
```

### Desktop App Settings
- Open the desktop app
- Go to Settings (gear icon)
- Configure sync preferences, AI settings, and storage options

## 🛠️ Development

### Project Structure
```
epitychia/
├── backend/          # Node.js API server
├── desktop/          # Tauri desktop application  
├── chrome-extension/ # Chrome browser extension
└── shared/           # Shared TypeScript types
```

### Running in Development Mode

1. **Backend**: `cd backend && npm run dev`
2. **Desktop**: `cd desktop && npm run tauri dev`  
3. **Extension**: Load unpacked in Chrome developer mode

### Building for Production

```bash
# Build desktop app
cd desktop
npm run tauri build

# Backend runs as-is (Node.js server)
cd backend
npm start
```

## 🔒 Privacy & Security

- **Local-First**: All data stored locally by default
- **Optional Cloud Sync**: Choose what to sync and when
- **Encrypted Storage**: Sensitive data is encrypted
- **No Tracking**: We don't collect personal information

## 🆘 Troubleshooting

### Common Issues

**Extension not working?**
- Make sure the backend is running (`npm run dev` in backend folder)
- Check that the extension is enabled in Chrome
- Reload the extension in `chrome://extensions/`

**Desktop app won't start?**
- Ensure Node.js 16+ is installed
- Run `npm install` in the desktop folder
- Check that no other app is using port 1420

**AI transformations not working?**
- The app works with fallback transformations even without AI API keys
- For full AI features, add your Hugging Face API key to backend/.env

**Backend connection errors?**
- Verify the backend is running on port 3000
- Check firewall settings
- Ensure no other service is using port 3000

### Getting Help

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Look at the backend terminal for server logs
3. Ensure all dependencies are installed correctly
4. Try restarting all services

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ for productivity enthusiasts**

*Epitychia transforms your clipboard into an intelligent assistant, making every copy-paste action more powerful and productive.*