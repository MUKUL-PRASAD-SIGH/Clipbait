# 🚀 Epitychia - Smart Clipboard Manager

**Epitychia** is an intelligent clipboard management system that automatically detects when you copy content and provides AI-powered suggestions for actions you can take with that content.

## ✨ Features

- 🔍 **Real-time Clipboard Monitoring** - Automatically detects system clipboard changes
- 🤖 **AI-Powered Suggestions** - Smart action recommendations based on copied content
- 🔐 **Firebase Authentication** - Google OAuth, GitHub OAuth, and email/password login
- 📱 **Cross-Platform** - Desktop (Tauri), Mobile (React Native), and Web support
- 🎯 **Smart Content Analysis** - Detects emails, URLs, phone numbers, addresses, and more
- 🔔 **System Notifications** - Instant suggestions via native notifications
- ⌨️ **Global Hotkeys** - Quick access with Ctrl+Shift+V
- 🌙 **System Tray Integration** - Runs quietly in the background

## 🏗️ Architecture

```
epitychia/
├── desktop/          # Tauri desktop app (React + TypeScript + Rust)
├── mobile/           # React Native mobile app
├── backend/          # Node.js API server (Express + TypeScript)
├── shared/           # Shared TypeScript types
└── docs/             # Documentation
```

## 🛠️ Tech Stack

### Desktop App
- **Framework**: Tauri (Rust + React)
- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand
- **Styling**: CSS3 + Custom Design System
- **Authentication**: Firebase Auth

### Mobile App
- **Framework**: React Native + TypeScript
- **State Management**: Zustand
- **Authentication**: Firebase Auth

### Backend
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: Firebase Admin SDK
- **AI Integration**: OpenAI/Custom AI Service

## 📋 Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   # Download from: https://nodejs.org/
   node --version  # Should be v18+
   ```

2. **Rust** (for desktop app)
   ```bash
   # Install from: https://rustup.rs/
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs/ | sh
   rustc --version  # Should show version
   ```

3. **Microsoft C++ Build Tools** (Windows only)
   - Download: [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
   - Select "C++ build tools" workload during installation
   - **Restart computer after installation**

4. **PostgreSQL** (for backend)
   ```bash
   # Download from: https://www.postgresql.org/download/
   # OR use Docker: docker run -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
   ```

### Optional Software

- **Docker** (for containerized deployment)
- **React Native CLI** (for mobile development)
- **Android Studio** (for Android mobile development)
- **Xcode** (for iOS mobile development - macOS only)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/epitychia.git
cd epitychia
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install desktop dependencies
cd desktop
npm install

# Install backend dependencies
cd ../backend
npm install

# Install mobile dependencies (optional)
cd ../mobile
npm install
```

### 3. Set Up Environment Variables

#### Desktop App
```bash
# desktop/.env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

#### Backend
```bash
# backend/.env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/epitychia
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
OPENAI_API_KEY=your-openai-api-key
```

### 4. Set Up Firebase

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Enable Authentication with Google and Email/Password

2. **Get Configuration**
   - Project Settings → General → Your apps → Web app
   - Copy configuration to `desktop/.env`

3. **Set Up Service Account**
   - Project Settings → Service accounts
   - Generate private key
   - Add credentials to `backend/.env`

### 5. Set Up Database
```bash
cd backend
npm run migrate  # Run database migrations
```

### 6. Start Development Servers

#### Option A: Start All Services
```bash
# From root directory
npm run dev  # Starts all services concurrently
```

#### Option B: Start Services Individually

**Backend:**
```bash
cd backend
npm run dev  # Starts on http://localhost:3001
```

**Desktop App (Web Mode):**
```bash
cd desktop
npm run dev  # Starts on http://localhost:1420
```

**Desktop App (Native Mode):**
```bash
cd desktop
npm run tauri dev  # Builds and runs native desktop app
```

**Mobile App:**
```bash
cd mobile
npm run android  # For Android
npm run ios      # For iOS (macOS only)
```

## 🎯 Usage

### Desktop App

1. **Launch the app** - Either via `npm run tauri dev` or the built executable
2. **Authenticate** - Sign in with Google, GitHub, or email/password
3. **Copy any content** - The app automatically monitors your clipboard
4. **Get suggestions** - AI-powered actions appear instantly
5. **Use global hotkey** - Press `Ctrl+Shift+V` to open the app anytime

### Features Demo

**Copy an email address:**
```
john.doe@example.com
```
**→ Suggestions:** Send Email, Add to Contacts, Copy to Clipboard

**Copy a URL:**
```
https://github.com/user/repo
```
**→ Suggestions:** Open in Browser, Download, Share, Bookmark

**Copy code:**
```javascript
function hello() { console.log("Hello World!"); }
```
**→ Suggestions:** Format Code, Run in Console, Save as Snippet

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Desktop tests
cd desktop && npm test

# Backend tests
cd backend && npm test

# Mobile tests
cd mobile && npm test
```

### Manual Testing
1. **Use the Test Panel** - Click "🧪 MVP Mode" in the desktop app
2. **Test clipboard monitoring** - Use "Read Current" and "Write Test" buttons
3. **Test AI suggestions** - Try the sample content provided

## 📦 Building for Production

### Desktop App
```bash
cd desktop
npm run tauri build  # Creates installer in src-tauri/target/release/bundle/
```

### Backend
```bash
cd backend
npm run build  # Creates dist/ folder
npm start      # Runs production server
```

### Mobile App
```bash
cd mobile
npm run build:android  # Creates APK
npm run build:ios      # Creates iOS app (macOS only)
```

### Docker Deployment
```bash
# Build and run all services
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Troubleshooting

### Common Issues

**"Failed to load clipboard history"**
- This is expected in web mode - the real clipboard monitoring only works in the native desktop app
- Run `npm run tauri dev` instead of `npm run dev`

**"Rust not found" or "cargo not found"**
```bash
# Add Rust to PATH (Windows)
$env:PATH += ";$env:USERPROFILE\.cargo\bin"

# Or restart terminal/computer after Rust installation
```

**"linker `link.exe` not found"**
- Install Microsoft C++ Build Tools
- Restart computer after installation
- Ensure "C++ build tools" workload is selected

**Firebase authentication not working**
- Check Firebase configuration in `.env` files
- Ensure Google authentication is enabled in Firebase Console
- Add `localhost` to authorized domains in Firebase

**Database connection failed**
- Ensure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Run migrations: `cd backend && npm run migrate`

### Getting Help

- 📖 Check the [Documentation](./docs/)
- 🐛 Report issues on [GitHub Issues](https://github.com/your-username/epitychia/issues)
- 💬 Join our [Discord Community](https://discord.gg/your-invite)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - For the amazing desktop app framework
- [Firebase](https://firebase.google.com/) - For authentication and backend services
- [OpenAI](https://openai.com/) - For AI-powered content analysis
- [React](https://reactjs.org/) - For the beautiful user interfaces

---

**Made with ❤️ by the Epitychia Team**

*Transform your clipboard into an intelligent productivity tool!*