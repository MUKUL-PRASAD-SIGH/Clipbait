# 🎯 Clipbait (Epitychia) - AI-Powered Smart Clipboard

**Transform your clipboard into an intelligent assistant with AI-powered suggestions and cross-platform synchronization.**

[🚀 Quick Start](#-quick-start-guide) • [📱 Features](#-key-features) • [🏗️ Architecture](#-project-architecture) • [🔧 Development](#-development) • [📖 Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [🎯 About](#-about)
- [✨ Key Features](#-key-features)
- [🏗️ Project Architecture](#-project-architecture)
- [🚀 Quick Start Guide](#-quick-start-guide)
- [📱 Applications](#-applications)
- [🎮 Usage](#-usage)
- [🔧 Development](#-development)
- [📊 API Reference](#-api-reference)
- [🔒 Security](#-security)
- [🛠️ Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 About

**Clipbait (Epitychia)** is an intelligent, multi-platform clipboard management system that revolutionizes how you interact with copied content. By combining native system integration with advanced AI capabilities, it transforms your simple copy-paste workflow into a powerful productivity tool.

### 🌟 Why Clipbait?

- **🧠 AI-First Approach**: Every copied item is analyzed for intelligent suggestions
- **⚡ Lightning Fast**: Sub-100ms clipboard detection with instant AI processing
- **🔄 Universal Sync**: Seamless synchronization across desktop, mobile, and web
- **🛡️ Privacy Focused**: Local-first storage with enterprise-grade encryption
- **🎯 Context Aware**: Understands content types and provides relevant actions

## ✨ Key Features

### 🤖 Intelligent AI Analysis
- **Smart Content Recognition**: Automatically detects emails, phone numbers, URLs, addresses, code snippets
- **Contextual Suggestions**: AI-powered actions like "Send Email", "Call Number", "Open Maps", "Format Code"
- **Multi-Model Support**: Integration with OpenAI GPT-4, Hugging Face, and local AI models
- **Learning Capabilities**: Improves suggestions based on usage patterns

### 📱 Cross-Platform Ecosystem
- **🖥️ Native Desktop App**: Built with Tauri (Rust + React) for optimal performance
- **🌐 Chrome Extension**: Instant browser integration with popup AI suggestions  
- **📱 Mobile Apps**: React Native apps for iOS and Android
- **☁️ Web Dashboard**: Full-featured web application for clipboard management

### 🔄 Real-Time Synchronization
- **Instant Sync**: Copy on any device, access immediately on all others
- **Conflict Resolution**: Smart merging of concurrent changes
- **Offline Support**: Full functionality without internet, syncs when reconnected
- **Selective Sync**: Choose what content to sync across devices

### 🛡️ Enterprise Security
- **AES-256 Encryption**: End-to-end encryption for all clipboard data
- **Zero-Knowledge Architecture**: Your data is private by design
- **Authentication**: Firebase Auth with Google, GitHub, and email/password support
- **Rate Limiting**: Advanced protection against abuse and attacks

### 🎨 Exceptional User Experience
- **Native System Integration**: Global hotkeys, system tray, notifications
- **Modern UI**: Beautiful, responsive design with dark/light themes
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation
- **Performance**: Optimized for speed with smooth animations and transitions

---

## 🏗️ Project Architecture

```
clipbait/
├── 📦 backend/                 # Node.js + Express API Server
│   ├── 🤖 ai-service/         # Python AI Processing Service
│   ├── 🗄️ database/           # PostgreSQL schemas & migrations
│   ├── 🔐 src/middleware/      # Auth, validation, rate limiting
│   ├── 🛣️ src/routes/         # API endpoints (auth, clipboard, AI)
│   └── 🧪 tests/              # Backend test suite
├── 🖥️ desktop/                # Tauri Desktop Application
│   ├── 🦀 src-tauri/          # Rust backend (system integration)
│   ├── ⚛️ src/                # React frontend components
│   └── 🎨 src/styles/         # UI styling and themes
├── 📱 mobile/                  # React Native Mobile Apps
│   ├── 🤖 android/            # Android-specific code
│   ├── 🍎 ios/                # iOS-specific code (future)
│   └── 📱 src/                # Shared mobile components
├── 🌐 chrome-extension/        # Chrome Browser Extension
│   ├── 📄 manifest.json       # Extension configuration
│   ├── 🔧 background.js       # Background script
│   └── 🎪 popup/              # Extension popup interface
├── 📄 docs/                   # Comprehensive documentation
└── 🔧 scripts/                # Build and deployment scripts
```

### 🔧 Technology Stack

| Component | Technologies |
|-----------|-------------|
| **Backend API** | Node.js, Express.js, TypeScript, PostgreSQL |
| **AI Service** | Python, FastAPI, OpenAI API, Hugging Face |
| **Desktop App** | Tauri (Rust + React), TypeScript, Vite |
| **Mobile Apps** | React Native, TypeScript, Expo |
| **Browser Extension** | Vanilla JavaScript, Chrome Extension API |
| **Authentication** | Firebase Auth, JWT tokens |
| **Database** | PostgreSQL with connection pooling |
| **Real-time** | Socket.IO, WebSockets |
| **Security** | AES-256 encryption, bcrypt, rate limiting |

## 🚀 Quick Start Guide

### 📋 Prerequisites

Ensure you have the following installed on your system:

| Requirement | Version | Download Link |
|-------------|---------|---------------|
| **Node.js** | 18.0+ | [nodejs.org](https://nodejs.org/) |
| **Python** | 3.8+ | [python.org](https://python.org/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **Rust** | 1.70+ | [rustup.rs](https://rustup.rs/) |
| **Google Chrome** | Latest | [chrome.google.com](https://chrome.google.com/) |

### ⚡ One-Command Setup

```bash
# Clone and setup everything automatically
git clone https://github.com/MUKUL-PRASAD-SIGH/Clipbait.git
cd Clipbait
npm run setup    # Installs all dependencies
npm run dev      # Starts all services
```

### 🔧 Manual Setup (Detailed)

#### 1️⃣ **Clone Repository**
```bash
git clone https://github.com/MUKUL-PRASAD-SIGH/Clipbait.git
cd Clipbait
```

#### 2️⃣ **Backend API Setup**
```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Configure your environment (optional)
# Edit .env file with your API keys and database settings

# Start the backend server
npm run dev
```
✅ Backend runs on `http://localhost:3001`

#### 3️⃣ **AI Service Setup**
```bash
cd backend/ai-service

# Create Python virtual environment (recommended)
python -m venv ai-env
source ai-env/bin/activate  # On Windows: ai-env\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start AI service
python ai_server.py
```
✅ AI Service runs on `http://localhost:5000`

#### 4️⃣ **Desktop App Setup**
```bash
cd desktop

# Install dependencies
npm install

# Start desktop development server
npm run tauri dev
```
✅ Desktop app launches automatically

#### 5️⃣ **Mobile App Setup** 
```bash
cd mobile

# Install dependencies
npm install

# For Android development
npm run android

# For web simulator
npm run web
```

#### 6️⃣ **Chrome Extension Setup**
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer Mode** (top-right toggle)
4. Click **"Load unpacked"**
5. Select the `chrome-extension` folder
6. Extension icon appears in browser toolbar

### 🎯 Verification Checklist

After setup, verify everything is working:

- [ ] **Backend API**: Visit `http://localhost:3001/health` - should return `{"status": "ok"}`
- [ ] **AI Service**: Visit `http://localhost:5000/health` - should return service status
- [ ] **Desktop App**: Should launch automatically and show login screen
- [ ] **Chrome Extension**: Click extension icon - should show popup interface
- [ ] **Clipboard Detection**: Copy text - should appear in desktop app history

---

## 📱 Applications

### 🖥️ Desktop Application (Tauri + React)

<details>
<summary><strong>🎯 Core Features</strong></summary>

- **Real-time Clipboard Monitoring**: Automatic detection of system clipboard changes
- **AI-Powered Suggestions**: Context-aware actions for copied content
- **Global Hotkeys**: `Ctrl+Shift+V` for instant access from anywhere
- **System Tray Integration**: Background operation with quick access menu
- **Cross-device Synchronization**: Real-time sync across all platforms
- **Secure Authentication**: Firebase Auth with multiple providers
- **Advanced Search**: Fuzzy search with filters and tags
- **Collections**: Organize clips into custom categories
- **Data Export/Import**: Full data portability and backup options

</details>

**Key Components:**
- `ClipboardManager`: Core clipboard monitoring and processing
- `SuggestionPanel`: AI-powered action suggestions display
- `AuthenticationFlow`: Secure user authentication and session management
- `DataSync`: Real-time synchronization with backend services
- `SettingsManager`: User preferences and configuration management

### 🌐 Chrome Extension

<details>
<summary><strong>🚀 Instant AI Suggestions</strong></summary>

- **Popup AI Interface**: Immediate suggestions when you copy text
- **Contextual Actions**: Smart actions based on content type
- **Seamless Integration**: Works with any website or web application
- **Privacy-First**: Optional clipboard monitoring with user control
- **Notification System**: Smart alerts with actionable suggestions
- **Quick Access**: One-click execution of AI-suggested actions

</details>

**Extension Architecture:**
```javascript
// Background script handles system integration
chrome.action.onClicked.addListener(() => {
  // Show popup with clipboard analysis
});

// Content script provides page-level clipboard detection
document.addEventListener('copy', (event) => {
  // Process clipboard content with AI
});
```

### 📱 Mobile Applications (React Native)

<details>
<summary><strong>📲 Cross-Platform Mobile Experience</strong></summary>

- **Native Performance**: Optimized for iOS and Android platforms
- **Push Notifications**: Smart alerts for clipboard activity
- **Biometric Authentication**: Secure access with fingerprint/face recognition
- **Offline Synchronization**: Full functionality without internet connection
- **Native Sharing**: Integration with system share functionality
- **Voice Commands**: Hands-free clipboard management
- **Widget Support**: Home screen widgets for quick access

</details>

**Mobile Features:**
- Cross-platform clipboard synchronization
- Native system integration (sharing, intents)
- Biometric security features
- Offline-first architecture with sync

### ☁️ Web Dashboard (Future)

- **Cloud Management**: Comprehensive clipboard history management
- **Team Collaboration**: Shared clipboard spaces for teams
- **Analytics Dashboard**: Usage insights and productivity metrics
- **Advanced Search**: Full-text search across all clipboard history
- **Data Visualization**: Visual representation of clipboard patterns

## 🎮 Usage

### 🖥️ Desktop Application

#### Basic Operations
```bash
# Global hotkey access
Ctrl+Shift+V          # Open clipboard panel anywhere
Ctrl+Shift+C          # Enhanced copy with AI analysis
Ctrl+Shift+H          # Show clipboard history
Ctrl+Shift+S          # Search clipboard
```

#### Core Workflows

<details>
<summary><strong>📋 Clipboard Management</strong></summary>

1. **Automatic Capture**: Copy text normally (`Ctrl+C`) - appears instantly in history
2. **Manual Organization**: Drag items into collections, add tags and descriptions
3. **Quick Search**: Use fuzzy search to find items across entire history
4. **Bulk Operations**: Select multiple items for batch actions
5. **Data Export**: Export history as JSON, CSV, or plain text

</details>

<details>
<summary><strong>🤖 AI-Powered Actions</strong></summary>

| Content Type | Available Actions |
|--------------|-------------------|
| **📧 Email Address** | Send Email, Add to Contacts, Create Calendar Event |
| **📞 Phone Number** | Call, SMS, WhatsApp, Add to Contacts |
| **🌐 URL/Link** | Open in Browser, Bookmark, Share, Archive |
| **📍 Address** | Open in Maps, Get Directions, Save Location |
| **💻 Code Snippet** | Format Code, Run Code, Open in IDE, Create Gist |
| **📄 Text Content** | Summarize, Translate, Grammar Check, Rewrite |
| **🔢 Numbers/Data** | Calculate, Convert Units, Generate Charts |

</details>

### 🌐 Chrome Extension

#### Instant AI Suggestions
1. **Copy any text** on a webpage
2. **AI popup appears** automatically with contextual suggestions
3. **Click any action** to execute immediately
4. **Results appear** in notification or new tab

#### Extension Features
```javascript
// Available through extension popup
- View recent clipboard history
- Toggle automatic AI processing
- Configure notification preferences  
- Manage connected accounts
- Export clipboard data
```

### 📱 Mobile Applications

#### Cross-Device Sync
- **Copy on desktop** → **Access on mobile** instantly
- **Smart notifications** when new clipboard items are available
- **Conflict resolution** for simultaneous editing across devices
- **Selective sync** for privacy-sensitive content

#### Mobile-Specific Features
- **Share integration**: Send clipboard items to any app
- **Voice input**: Dictate directly to clipboard
- **Widgets**: Quick access from home screen
- **Biometric security**: Secure access with fingerprint/face ID

-
## 📊 Project Status & License

### 📈 Current Status
[![Build Status](https://img.shields.io/github/workflow/status/MUKUL-PRASAD-SIGH/Clipbait/CI)](https://github.com/MUKUL-PRASAD-SIGH/Clipbait/actions)
[![Coverage](https://img.shields.io/codecov/c/github/MUKUL-PRASAD-SIGH/Clipbait)](https://codecov.io/gh/MUKUL-PRASAD-SIGH/Clipbait)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


### 🛠️ Built With
[Tauri](https://tauri.app/) • [React](https://reactjs.org/) • [Node.js](https://nodejs.org/) • [PostgreSQL](https://postgresql.org/) • [OpenAI](https://openai.com/api/) • [Firebase](https://firebase.google.com/)

### 📄 License
**MIT License** - Copyright (c) 2024 Clipbait Team. See [LICENSE](LICENSE) for details.

<div align="center">

**🚀 Made with ❤️ for Productivity Enthusiasts**

*Transform your clipboard into an intelligent assistant.*

[![⭐ Star](https://img.shields.io/github/stars/MUKUL-PRASAD-SIGH/Clipbait?style=social)](https://github.com/MUKUL-PRASAD-SIGH/Clipbait) • [🐛 Report Bug](https://github.com/MUKUL-PRASAD-SIGH/Clipbait/issues) • [💡 Request Feature](https://github.com/MUKUL-PRASAD-SIGH/Clipbait/issues/new)

</div>
