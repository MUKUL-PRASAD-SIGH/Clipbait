import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Toaster } from 'react-hot-toast';
import { useClipboardStore } from './store/clipboardStore';
import { useAuthStore } from './store/authStore';
import { ClipboardHistory } from './components/ClipboardHistory';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';
import { SuggestionPanel } from './components/SuggestionPanel';

function App() {
  const { isAuthenticated, initialize: initAuth } = useAuthStore();
  const { addClipboardItem, initialize: initClipboard } = useClipboardStore();

  useEffect(() => {
    initAuth();
    
    if (isAuthenticated) {
      initClipboard();
    }
  }, [isAuthenticated, initAuth, initClipboard]);

  useEffect(() => {
    // Listen for clipboard changes from Tauri
    const unlisten = listen('clipboard-changed', (event) => {
      const content = event.payload as string;
      addClipboardItem(content);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [addClipboardItem]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoginForm />
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <div className="flex-1">
          <ClipboardHistory />
        </div>
        <div className="w-80 border-l border-gray-200">
          <SuggestionPanel />
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;