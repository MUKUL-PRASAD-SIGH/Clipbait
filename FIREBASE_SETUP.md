# Firebase Authentication Setup Guide

## 🚀 Quick Start (Current Status)

The Google authentication is **ready to work** but currently using demo configuration. Follow the steps below to enable real Firebase authentication.

## 🔥 Setting Up Real Firebase Authentication

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "epitychia-clipboard")
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click "Enable" → Save
   - **Google**: Click "Enable" → Save
   - **GitHub**: Click "Enable" → Add your GitHub OAuth App credentials (optional)

### Step 3: Configure Web App

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Enter app nickname (e.g., "Epitychia Desktop")
5. **Don't** check "Set up Firebase Hosting"
6. Click "Register app"
7. Copy the Firebase configuration object

### Step 4: Update Environment Variables

1. Open `desktop/.env` file
2. Replace the demo values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 5: Configure Authorized Domains

1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - Your production domain (when deployed)

### Step 6: Test Authentication

1. Restart the development server: `npm run dev`
2. Open the app at `http://localhost:5173/`
3. Click "🔑 Show Auth" button
4. Try "Continue with Google" - it should now work with real Google accounts!

## 🧪 Current Implementation Features

✅ **Working Now:**
- Complete Firebase integration
- Google OAuth authentication
- GitHub OAuth authentication (when configured)
- Email/password authentication
- Error handling with user-friendly messages
- Automatic token management
- Auth state persistence

✅ **UI Features:**
- Beautiful authentication page
- Loading states
- Error messages
- Form validation
- Responsive design

## 🔧 Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/popup-blocked)"**
   - Allow popups in your browser
   - Try signing in again

2. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to Firebase authorized domains
   - Make sure localhost is included for development

3. **"Firebase: Error (auth/invalid-api-key)"**
   - Check your API key in `.env` file
   - Make sure there are no extra spaces or quotes

4. **Authentication not working**
   - Verify all environment variables are set correctly
   - Check browser console for errors
   - Ensure Firebase project has authentication enabled

## 🔒 Security Notes

- Never commit real Firebase credentials to version control
- The current `.env` file has demo values - safe to commit
- Use environment variables for all sensitive data
- Enable Firebase Security Rules for production

## 📱 Next Steps

Once Firebase is configured:
1. **Mobile App**: Add the same Firebase project to mobile app
2. **Backend Integration**: Connect Firebase tokens with your backend
3. **User Profiles**: Extend user data with custom claims
4. **Security Rules**: Set up Firestore security rules

## 🎯 Testing the Implementation

### Current Demo Mode:
- All buttons work but use placeholder authentication
- Perfect for UI testing and development

### Production Mode (after Firebase setup):
- Real Google OAuth authentication
- Real email/password authentication
- Persistent sessions across app restarts
- Secure token management

---

**Need Help?** 
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)