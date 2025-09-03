import React, { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Toaster } from 'react-hot-toast';
import { useClipboardStore } from './store/clipboardStore';
import { useAuthStore } from './store/authStore';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/LoginForm';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const { isAuthenticated, loading, initialize: initAuth } = useAuthStore();
  const { addClipboardItem, initialize: initClipboard } = useClipboardStore();

  useEffect(() => {
    initAuth();
    
    if (isAuthenticated) {
      initClipboard();
    }
  }, [isAuthenticated, initAuth, initClipboard]);

  useEffect(() => {
    // Listen for clipboard changes from Tauri
    const unlisten = listen('clipboard-changed', (event: any) => {
      const content = event.payload as string;
      addClipboardItem(content);
    });

    return () => {
      unlisten.then((fn: any) => fn());
    };
  }, [addClipboardItem]);

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
          <Toaster position="top-right" />
        </div>
      </ErrorBoundary>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoginForm />
          <Toaster position="top-right" />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Dashboard />
        <Toaster position="top-right" />
      </div>
    </ErrorBoundary>
  );
}

export default App;