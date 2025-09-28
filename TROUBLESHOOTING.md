# 🔧 Troubleshooting Guide

## Quick Fixes

### 1. Backend Won't Start

**Problem**: Backend shows errors on startup

**Solutions**:
```bash
# Check if backend is healthy
npm run check

# If not running, start backend
npm run dev:backend

# Check the logs for specific errors
```

**Common Issues**:
- ✅ **Database Error**: Fixed - now uses memory storage in demo mode
- ✅ **Firebase Error**: Fixed - Firebase is optional in demo mode
- ✅ **Missing Environment Variables**: Fixed - all optional in demo mode

### 2. Frontend Won't Connect

**Problem**: Frontend can't reach backend

**Solutions**:
```bash
# 1. Make sure backend is running first
npm run check

# 2. Start frontend
npm run dev:desktop

# 3. Check browser console for errors
```

### 3. Authentication Issues

**Problem**: Can't login or register

**Solutions**:
- Backend uses memory storage in demo mode
- Any email/password combination works for registration
- Tokens are stored in localStorage
- Clear browser storage if needed: `localStorage.clear()`

### 4. Features Not Working

**Problem**: AI features, collections, etc. not working

**Solutions**:
- All features work in demo mode with fallbacks
- Check browser console for JavaScript errors
- Refresh the page
- Clear browser cache

## Step-by-Step Debugging

### 1. Check Backend Status
```bash
# Quick health check
curl http://localhost:3000/health

# Or use our script
npm run check
```

### 2. Check Frontend Status
```bash
# Make sure Vite dev server is running
# Should show: "Local: http://localhost:3001"
```

### 3. Test API Endpoints
```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test clipboard (need token from registration)
curl -X GET http://localhost:3000/api/clipboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Browser Console Errors

**Open Developer Tools (F12) and check for**:
- Network errors (failed API calls)
- JavaScript errors (component issues)
- CORS errors (backend not running)

## Environment Issues

### Windows-Specific
```bash
# If npm scripts don't work, try:
cd backend
npm run dev

# In another terminal:
cd desktop  
npm run dev
```

### Port Conflicts
```bash
# If ports 3000 or 3001 are in use:
# Backend: Change PORT in backend/.env
# Frontend: Vite will auto-increment port
```

### Node.js Version
```bash
# Make sure you have Node.js 16+ 
node --version

# If not, update Node.js
```

## Reset Everything

### 1. Clean Install
```bash
# Remove all node_modules
rm -rf backend/node_modules desktop/node_modules node_modules

# Reinstall everything
npm run install:all
```

### 2. Reset Browser State
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
// Then refresh page
```

### 3. Reset Backend State
```bash
# Backend uses memory storage, so just restart:
# Ctrl+C to stop, then npm run dev:backend
```

## Still Having Issues?

### Check These Files

1. **Backend Logs**: Look for errors in terminal running backend
2. **Browser Console**: F12 → Console tab
3. **Network Tab**: F12 → Network tab (check for failed requests)

### Common Error Messages

**"Failed to fetch"**
- Backend is not running
- Wrong port (should be 3000 for backend)
- CORS issue (restart backend)

**"Invalid token"**
- Clear localStorage and login again
- Check if backend restarted (tokens are memory-only in demo)

**"Component not found"**
- Frontend build issue
- Restart frontend dev server

### Working Configuration

**Backend should show**:
```
✅ Memory storage initialized
✅ Firebase initialization skipped (demo mode)  
✅ AI Service initialized with rule-based classification
✅ Server running on port 3000
```

**Frontend should show**:
```
✅ Local: http://localhost:3001/
✅ ready in XXXms
```

**Browser should show**:
- Login/Register page at http://localhost:3001
- No console errors
- Network requests to http://localhost:3000 succeed

## Success Indicators

### ✅ Everything Working
- Backend starts without errors
- Frontend loads at http://localhost:3001
- Can register/login
- Can add clipboard items
- All UI components respond
- No console errors

### 🎯 Test All Features
```bash
# Run comprehensive test
npm test
```

This will test all API endpoints and confirm everything is working!

## Need More Help?

1. **Check the logs** in both backend and frontend terminals
2. **Run the test suite**: `npm test`
3. **Try the health check**: `npm run check`
4. **Start fresh**: Clean install and restart everything

The application is designed to work out-of-the-box in demo mode, so if you're still having issues, it's likely a simple configuration or startup order problem.