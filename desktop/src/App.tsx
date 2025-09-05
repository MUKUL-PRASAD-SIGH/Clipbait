import React, { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Toaster } from 'react-hot-toast';
import { useClipboardStore } from './store/clipboardStore';
import { useAuthStore } from './store/authStore';
import { Dashboard } from './components/Dashboard';
import { AuthPage } from './components/AuthPage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ClipboardTestPanel } from './components/ClipboardTestPanel';
import { LiveActionNotification } from './components/LiveActionNotification';
import { Button } from './components/ui/Button';

function App() {
  const { isAuthenticated, loading, initialize: initAuth } = useAuthStore();
  const { 
    addClipboardItem, 
    initialize: initClipboard, 
    showLiveNotification, 
    liveNotificationContent, 
    hideLiveNotification 
  } = useClipboardStore();
  const [showTestPanel, setShowTestPanel] = useState(true); // For MVP testing
  const [showAuth, setShowAuth] = useState(false);
  const [mvpMode, setMvpMode] = useState(true); // Toggle between MVP and Auth mode

  useEffect(() => {
    if (!mvpMode) {
      initAuth();
    }
    initClipboard();
  }, [initClipboard, initAuth, mvpMode]);

  useEffect(() => {
    // Listen for clipboard changes from Tauri
    const unlisten = listen('clipboard-changed', (event: any) => {
      const content = event.payload as string;
      console.log('🔥 CLIPBOARD CHANGED! Showing instant actions for:', content.substring(0, 50) + '...');
      
      // Add to clipboard store AND trigger live notification
      addClipboardItem(content);
    });

    return () => {
      unlisten.then((fn: any) => fn());
    };
  }, [addClipboardItem]);

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" variant="primary" />
            <p className="mt-4 text-gray-600 animate-pulse">Initializing Epitychia...</p>
          </div>
          <Toaster position="top-right" />
        </div>
      </ErrorBoundary>
    );
  }

  // Show authentication page if not in MVP mode and not authenticated
  if (!mvpMode && !isAuthenticated && !showAuth) {
    return (
      <ErrorBoundary>
        <AuthPage />
        <Toaster position="top-right" />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Mode Toggle */}
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant={mvpMode ? 'success' : 'outline'}
            size="sm"
            onClick={() => setMvpMode(!mvpMode)}
            className="shadow-lg"
          >
            {mvpMode ? '🧪 MVP Mode' : '🔐 Auth Mode'}
          </Button>
        </div>

        {/* Authentication Toggle (when in MVP mode) */}
        {mvpMode && (
          <div className="fixed top-4 left-32 z-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAuth(!showAuth)}
              className="shadow-lg"
            >
              {showAuth ? 'Hide Auth' : '🔑 Show Auth'}
            </Button>
          </div>
        )}

        {/* MVP Test Panel */}
        {showTestPanel && (
          <div className="fixed top-4 right-4 z-50">
            <ClipboardTestPanel onClose={() => setShowTestPanel(false)} />
          </div>
        )}

        {/* Authentication Overlay (MVP mode) */}
        {showAuth && mvpMode && (
          <AuthPage onClose={() => setShowAuth(false)} />
        )}

        {/* LIVE ACTION NOTIFICATION - Shows instantly when you copy something */}
        {showLiveNotification && liveNotificationContent && (
          <LiveActionNotification
            content={liveNotificationContent}
            onClose={hideLiveNotification}
            position="top-right"
          />
        )}
        
        <Dashboard />
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '10px',
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;