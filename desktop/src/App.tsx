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
import { CommandPalette } from './components/CommandPalette';
import { CollectionsManager } from './components/CollectionsManager';
import { StagingArea } from './components/StagingArea';
import { InstantAIPopup } from './components/InstantAIPopup';
import { Button } from './components/ui/Button';

function App() {
  const { isAuthenticated, loading, initialize: initAuth } = useAuthStore();
  const { 
    addClipboardItem, 
    initialize: initClipboard, 
    isLiveNotificationVisible, 
    liveNotificationContent, 
    hideLiveNotification 
  } = useClipboardStore();
  
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showStagingArea, setShowStagingArea] = useState(false);
  const [instantAI, setInstantAI] = useState<{
    visible: boolean;
    content: string;
    position?: { x: number; y: number };
  }>({ visible: false, content: '' });

  useEffect(() => {
    // Always initialize auth first
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    // Only initialize clipboard after authentication
    if (isAuthenticated) {
      initClipboard();
    }
  }, [isAuthenticated, initClipboard]);

  useEffect(() => {
    // Check if we're in Tauri (native) or web environment
    const isTauri = window.__TAURI__ !== undefined;
    
    if (isTauri) {
      // Listen for clipboard changes from Tauri (native app)
      const unlisten = listen('clipboard-changed', (event: any) => {
        const content = event.payload as string;
        handleClipboardChange(content);
      });

      return () => {
        unlisten.then((fn: any) => fn());
      };
    } else {
      // Web environment - use polling for clipboard changes
      let lastClipboardContent = '';
      
      const checkClipboard = async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.readText) {
            const content = await navigator.clipboard.readText();
            if (content && content !== lastClipboardContent && content.length > 0) {
              lastClipboardContent = content;
              handleClipboardChange(content);
            }
          }
        } catch (error) {
          // Clipboard access denied or not available
          console.log('Clipboard access not available in web mode');
        }
      };

      // Poll clipboard every 1 second in web mode
      const interval = setInterval(checkClipboard, 1000);
      
      return () => clearInterval(interval);
    }
  }, [addClipboardItem]);

  const handleClipboardChange = (content: string) => {
    console.log('🔥 CLIPBOARD CHANGED! Showing instant AI popup for:', content.substring(0, 50) + '...');
    
    // Add to clipboard store
    addClipboardItem(content);
    
    // Show instant AI popup with smart positioning
    const mouseX = window.innerWidth / 2;
    const mouseY = window.innerHeight / 2;
    
    setInstantAI({
      visible: true,
      content,
      position: { x: mouseX, y: mouseY }
    });
    
    // Auto-hide after 15 seconds if no interaction
    setTimeout(() => {
      setInstantAI(prev => ({ ...prev, visible: false }));
    }, 15000);
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: Ctrl+Shift+Space
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Collections: Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
        e.preventDefault();
        setShowCollections(true);
      }
      // Staging Area: Ctrl+Shift+S
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
        e.preventDefault();
        setShowStagingArea(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Always show authentication page if not authenticated
  if (!isAuthenticated) {
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
        {/* Clean Header Bar */}
        <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-40">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900">Epitychia</h1>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>AI Monitoring</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCommandPalette(true)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  🎯 Search
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCollections(true)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  📁 Collections
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStagingArea(true)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  📋 Multi-Paste
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTestPanel(!showTestPanel)}
                className="text-gray-600 hover:text-gray-900"
              >
                🧪 Test
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Test AI popup with sample content
                  const sampleContent = "Contact John Doe at john.doe@example.com or call (555) 123-4567 for the meeting on Monday at 2 PM.";
                  handleClipboardChange(sampleContent);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                🤖 Test AI
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Logout functionality
                  localStorage.removeItem('token');
                  window.location.reload();
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content with top padding */}
        <div className="pt-16">
          <Dashboard />
          
          {/* MVP Test Panel */}
          {showTestPanel && (
            <div className="fixed bottom-4 right-4 z-50">
              <ClipboardTestPanel onClose={() => setShowTestPanel(false)} />
            </div>
          )}
        </div>

        {/* Enhanced Components */}
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onExecute={(result) => {
            console.log('Command executed:', result);
          }}
        />

        {showCollections && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6">
                <CollectionsManager
                  onSelectCollection={(collection) => {
                    console.log('Selected collection:', collection);
                    setShowCollections(false);
                  }}
                  onCreateCollection={(name, description) => {
                    console.log('Created collection:', name, description);
                  }}
                />
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end">
                <Button variant="outline" onClick={() => setShowCollections(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        <StagingArea
          isOpen={showStagingArea}
          onClose={() => setShowStagingArea(false)}
          onPaste={(format) => {
            console.log('Pasting format:', format);
            navigator.clipboard.writeText(format.content);
            setShowStagingArea(false);
          }}
        />

        {/* INSTANT AI POPUP - Shows immediately when you copy something */}
        <InstantAIPopup
          content={instantAI.content}
          isVisible={instantAI.visible}
          onClose={() => setInstantAI(prev => ({ ...prev, visible: false }))}
          position={instantAI.position}
        />

        {/* LIVE ACTION NOTIFICATION - Shows instantly when you copy something */}
        {isLiveNotificationVisible && liveNotificationContent && (
          <LiveActionNotification
            content={liveNotificationContent}
            onClose={hideLiveNotification}
            position="top-right"
          />
        )}
        
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