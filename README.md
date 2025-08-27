# Epitychia - Smart Clipboard Application

Epitychia is an intelligent, cross-platform clipboard application that eliminates digital friction in copy-paste workflows. It proactively understands copied content and suggests relevant, time-saving actions while maintaining privacy through on-device AI processing.

## Features

- **Smart Content Analysis**: AI-powered content classification and entity extraction
- **Intelligent Suggestions**: Context-aware action suggestions (open maps, create events, etc.)
- **Cross-Platform Sync**: Seamless synchronization across desktop and mobile devices
- **Privacy-Centric**: On-device AI processing for sensitive data
- **Searchable History**: Intelligent clipboard history with full-text search
- **Real-time Sync**: Instant synchronization across all your devices

## Architecture

### Backend
- **Node.js/TypeScript** with Express framework
- **PostgreSQL** database for data persistence
- **Firebase** for authentication and real-time notifications
- **ONNX Runtime** for on-device AI inference
- **Socket.IO** for real-time synchronization

### Desktop App
- **Tauri** framework with React/TypeScript frontend
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Native clipboard integration** with system-level monitoring

### Mobile App
- **React Native** with TypeScript
- **React Navigation** for navigation
- **Zustand** for state management
- **Native clipboard access** and background processing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Rust (for Tauri desktop app)
- React Native development environment (for mobile app)
- Docker and Docker Compose (optional)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/epitychia.git
   cd epitychia
   ```

2. **Start with Docker Compose (Recommended)**
   ```bash
   docker-compose up -d
   ```

3. **Or set up manually:**

   **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

   **Desktop App Setup:**
   ```bash
   cd desktop
   npm install
   npm run tauri dev
   ```

   **Mobile App Setup:**
   ```bash
   cd mobile
   npm install
   # For iOS
   npx react-native run-ios
   # For Android
   npx react-native run-android
   ```

### Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/epitychia
JWT_SECRET=your-jwt-secret
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

## Project Structure

```
epitychia/
├── backend/                 # Node.js/TypeScript backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── database/       # Database configuration
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── desktop/                 # Tauri desktop application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   ├── src-tauri/          # Tauri Rust backend
│   └── package.json
├── mobile/                  # React Native mobile app
│   ├── src/
│   │   ├── screens/        # Screen components
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json
├── shared/                  # Shared types and utilities
│   └── types/
└── docker-compose.yml       # Development environment
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Clipboard
- `GET /api/clipboard/history` - Get clipboard history
- `POST /api/clipboard/add` - Add new clipboard item
- `DELETE /api/clipboard/:id` - Delete clipboard item
- `GET /api/clipboard/search` - Search clipboard history
- `POST /api/clipboard/execute-suggestion/:id` - Execute action suggestion

### AI Processing
- `POST /api/ai/process` - Process content with AI
- `GET /api/ai/suggestions/:itemId` - Get suggestions for item

## Development Phases

### Phase 1: Foundation & Prototyping ✅
- [x] Backend API with authentication
- [x] Database schema and models
- [x] Basic desktop app with Tauri
- [x] Mobile app scaffolding
- [x] Docker development environment

### Phase 2: Core AI & Feature Integration 🚧
- [ ] ONNX model integration
- [ ] Advanced entity extraction
- [ ] Real-time synchronization
- [ ] Native app integrations
- [ ] Background clipboard monitoring

### Phase 3: Refinement & Deployment 📋
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Production deployment
- [ ] App store preparation
- [ ] Documentation completion

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web technologies and AI/ML frameworks
- Inspired by the need for intelligent clipboard management
- Designed with privacy and user experience as top priorities