import React, { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { LiveActionNotification } from './LiveActionNotification';
import toast from 'react-hot-toast';

export const WebClipboardMonitor: React.FC = () => {
  const [lastClipboard, setLastClipboard] = useState('');
  const [currentClipboard, setCurrentClipboard] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Monitor clipboard every 500ms when active
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text !== lastClipboard && text.trim().length > 0) {
          console.log('🔥 CLIPBOARD CHANGED!', text.substring(0, 50));
          setLastClipboard(text);
          setCurrentClipboard(text);
          setShowNotification(true);
          
          // Show toast notification
          toast.success('Clipboard detected! Actions available', {
            icon: '⚡',
            duration: 2000
          });
        }
      } catch (error) {
        // Clipboard access denied or not available
        console.log('Clipboard access not available');
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isMonitoring, lastClipboard]);

  const startMonitoring = async () => {
    try {
      // Request clipboard permission
      await navigator.clipboard.readText();
      setIsMonitoring(true);
      toast.success('Clipboard monitoring started! Copy something to see actions.', {
        icon: '👀',
        duration: 4000
      });
    } catch (error) {
      toast.error('Clipboard access denied. Please allow clipboard permissions.', {
        icon: '🚫',
        duration: 4000
      });
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    toast('Clipboard monitoring stopped', { icon: '⏹️' });
  };

  const testWithSample = (content: string) => {
    setCurrentClipboard(content);
    setShowNotification(true);
    toast.success('Testing with sample content!', { icon: '🧪' });
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className={isMonitoring ? 'animate-pulse' : ''}>
              {isMonitoring ? '👀' : '📋'}
            </span>
            Web Clipboard Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            {isMonitoring 
              ? '✅ Monitoring clipboard - copy something to see instant actions!'
              : '⏸️ Click start to monitor clipboard changes'
            }
          </div>

          <div className="flex gap-2">
            {!isMonitoring ? (
              <Button onClick={startMonitoring} className="flex-1" variant="gradient">
                🚀 Start Monitoring
              </Button>
            ) : (
              <Button onClick={stopMonitoring} className="flex-1" variant="outline">
                ⏹️ Stop Monitoring
              </Button>
            )}
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-2">Test with sample content:</p>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => testWithSample('john.doe@example.com')}
                className="w-full text-left justify-start"
              >
                📧 Email: john.doe@example.com
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => testWithSample('https://github.com/user/awesome-project')}
                className="w-full text-left justify-start"
              >
                🔗 URL: https://github.com/user/awesome-project
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => testWithSample('+1-555-123-4567')}
                className="w-full text-left justify-start"
              >
                📞 Phone: +1-555-123-4567
              </Button>
            </div>
          </div>

          {lastClipboard && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-1">Last detected:</p>
              <div className="text-xs bg-gray-50 p-2 rounded max-h-16 overflow-hidden">
                {lastClipboard.substring(0, 100)}...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Action Notification */}
      {showNotification && currentClipboard && (
        <LiveActionNotification
          content={currentClipboard}
          onClose={() => setShowNotification(false)}
          position="top-right"
        />
      )}
    </>
  );
};