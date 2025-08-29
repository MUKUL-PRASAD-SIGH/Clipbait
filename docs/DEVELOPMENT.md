# Development Guide

## Prerequisites

- Node.js 18+
- Rust (for Tauri desktop app)
- Docker & Docker Compose
- PostgreSQL 15+

## Quick Start

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd epitychia
   npm run setup
   ```

2. **Start development environment**
   ```bash
   # Start database
   npm run docker:up
   
   # Start all services
   npm run dev
   ```

## Project Structure

```
epitychia/
├── backend/          # Node.js/Express API
├── desktop/          # Tauri desktop app
├── mobile/           # React Native mobile app
├── shared/           # Shared TypeScript types
└── docs/             # Documentation
```

## Development Workflow

### Backend Development
```bash
cd backend
npm run dev          # Start with hot reload
npm test            # Run tests
npm run lint        # Check code style
```

### Desktop Development
```bash
cd desktop
npm run tauri dev   # Start Tauri dev server
npm test           # Run component tests
```

### Mobile Development
```bash
cd mobile
npm start          # Start Metro bundler
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
```

## Testing

- **Unit Tests**: Jest + Testing Library
- **Integration Tests**: Supertest for API
- **E2E Tests**: Playwright (planned)

Run all tests:
```bash
npm test
```

## Code Style

- ESLint + Prettier for formatting
- TypeScript strict mode
- Conventional commits

## Database

Local development uses Docker PostgreSQL:
```bash
npm run docker:up    # Start database
npm run docker:down  # Stop database
```

## Environment Variables

Create `.env` files in each service directory:

**backend/.env**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/epitychia
FIREBASE_PROJECT_ID=your-project-id
JWT_SECRET=your-secret
```

**desktop/.env**
```
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_CONFIG={"apiKey":"..."}
```

## Deployment

- Backend: Docker containers
- Desktop: Tauri builds for Windows/macOS/Linux
- Mobile: React Native builds for iOS/Android

## Troubleshooting

### Common Issues

1. **Tauri build fails**: Ensure Rust is installed
2. **Database connection**: Check Docker is running
3. **Mobile build fails**: Check React Native environment setup

### Getting Help

- Check existing issues in GitHub
- Review documentation in `/docs`
- Ask team members in development chat