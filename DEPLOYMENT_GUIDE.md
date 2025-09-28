# 🚀 Epitychia MVP - Production Deployment Guide

## Overview

Epitychia is a smart clipboard management system with AI-powered content analysis. This guide will help you deploy the complete MVP with all components.

## Architecture

- **Backend**: Node.js/Express API with PostgreSQL
- **Desktop App**: Tauri-based desktop application 
- **Chrome Extension**: Browser extension for web page clipboard capture
- **AI Processing**: OpenAI integration for content analysis and suggestions

## Prerequisites

1. **Docker & Docker Compose** - For containerized deployment
2. **Firebase Account** - For authentication
3. **OpenAI API Key** (Optional) - For AI features
4. **Domain/Server** - For production deployment

## Quick Start (Local Development)

### 1. Clone and Setup

```bash
git clone <your-repo>
cd epitychia
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.production .env

# Edit .env with your values
nano .env
```

Required environment variables:
```env
# Database
POSTGRES_PASSWORD=your_secure_password

# Security
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Firebase (from your Firebase console)
FIREBASE_PROJECT_ID=epitychia-4712f
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@epitychia-4712f.iam.gserviceaccount.com
FIREBASE_API_KEY=AIzaSyC7w5P50YjpTBv7ZVeI1XfRBDMAtpF4GJE
FIREBASE_AUTH_DOMAIN=epitychia-4712f.firebaseapp.com
FIREBASE_STORAGE_BUCKET=epitychia-4712f.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=486630077358
FIREBASE_APP_ID=1:486630077358:web:8a082bcfa127d05887ce3f

# OpenAI (Optional)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Deploy

**Windows:**
```cmd
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension/` folder
5. Pin the extension to your toolbar

## How It Works

### 🔄 Sync Flow

1. **Chrome Extension** monitors clipboard on web pages
2. **Desktop App** monitors system-wide clipboard
3. Both send clipboard data to **Backend API**
4. **AI Service** processes content for entities and suggestions
5. Data syncs across all devices in real-time

### 🤖 AI Features

- **Entity Detection**: Emails, phones, URLs, addresses, dates
- **Content Categorization**: Contact, event, location, document, code
- **Smart Suggestions**: Create email, make professional, fix grammar
- **Transformations**: Summarize, expand, translate

### 🔐 Security

- **JWT Authentication** with Firebase integration
- **Content Encryption** for sensitive data
- **Rate Limiting** to prevent abuse
- **Input Validation** and SQL injection protection

## Production Deployment

### Cloud Deployment (AWS/GCP/Azure)

1. **Database**: Use managed PostgreSQL (RDS/Cloud SQL)
2. **Backend**: Deploy to container service (ECS/Cloud Run/Container Apps)
3. **Frontend**: Deploy to CDN (CloudFront/Cloud CDN)
4. **Domain**: Configure SSL certificates

### Environment Variables for Production

```env
# Production URLs
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com

# Database (managed service)
DATABASE_URL=postgresql://user:pass@your-db-host:5432/epitychia

# Security (generate strong keys)
JWT_SECRET=your_production_jwt_secret_64_chars_minimum
ENCRYPTION_KEY=your_32_character_encryption_key_prod
```

### SSL Configuration

Update `nginx.conf` for HTTPS:
```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

## Chrome Extension Distribution

### Development Testing
- Load unpacked extension from `chrome-extension/` folder

### Production Distribution
1. **Chrome Web Store**: Package and submit for review
2. **Enterprise**: Use Chrome Enterprise policies
3. **Self-hosted**: Distribute .crx file

### Extension Permissions
The extension requires:
- `clipboardRead` - To monitor clipboard changes
- `storage` - To store auth tokens
- `activeTab` - To inject content scripts
- `notifications` - To show capture notifications

## Desktop App Distribution

### Development
- Run with `npm run tauri dev` in desktop folder

### Production Builds
```bash
cd desktop
npm run tauri build
```

Generates installers for:
- **Windows**: `.msi` installer
- **macOS**: `.dmg` installer  
- **Linux**: `.deb` and `.AppImage`

## Monitoring & Maintenance

### Health Checks
- Backend: `GET /health`
- Frontend: `GET /health`
- Database: Built-in PostgreSQL health checks

### Logs
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Database Backups
```bash
# Backup
docker exec postgres pg_dump -U epitychia epitychia > backup.sql

# Restore
docker exec -i postgres psql -U epitychia epitychia < backup.sql
```

## Troubleshooting

### Common Issues

**1. Chrome Extension Not Capturing**
- Check if user is logged in
- Verify backend connectivity
- Check browser permissions

**2. Desktop App Not Starting**
- Verify Tauri dependencies
- Check port 1420 availability
- Review build logs

**3. AI Features Not Working**
- Verify OpenAI API key
- Check rate limits
- Review AI service logs

**4. Authentication Issues**
- Verify Firebase configuration
- Check JWT secret consistency
- Review token expiration

### Debug Commands

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# View database
docker exec -it postgres psql -U epitychia epitychia

# Test API endpoints
curl http://localhost/api/health
```

## Performance Optimization

### Database
- Index frequently queried columns
- Implement connection pooling
- Regular VACUUM and ANALYZE

### Backend
- Enable response compression
- Implement caching (Redis)
- Optimize AI processing

### Frontend
- Enable asset compression
- Implement service workers
- Optimize bundle size

## Security Checklist

- [ ] Strong JWT secrets in production
- [ ] Database credentials secured
- [ ] HTTPS enabled with valid certificates
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Content encryption for sensitive data
- [ ] Regular security updates
- [ ] Firewall rules configured

## Support

For issues and questions:
1. Check logs first
2. Review this guide
3. Check GitHub issues
4. Contact support team

---

🎉 **Congratulations!** Your Epitychia MVP is now production-ready with:
- ✅ Cross-platform clipboard sync
- ✅ AI-powered content analysis  
- ✅ Chrome extension integration
- ✅ Desktop application
- ✅ Secure authentication
- ✅ Production deployment