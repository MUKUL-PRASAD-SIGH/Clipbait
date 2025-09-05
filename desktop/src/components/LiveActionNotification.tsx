import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import toast from 'react-hot-toast';

interface LiveAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  primary?: boolean;
}

interface LiveActionNotificationProps {
  content: string;
  onClose: () => void;
  position?: 'top-right' | 'top-center' | 'bottom-right';
}

export const LiveActionNotification: React.FC<LiveActionNotificationProps> = ({
  content,
  onClose,
  position = 'top-right'
}) => {
  const [actions, setActions] = useState<LiveAction[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Generate instant actions based on content
    const generatedActions = generateInstantActions(content);
    setActions(generatedActions);

    // Auto-hide after 10 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [content]);

  const generateInstantActions = (text: string): LiveAction[] => {
    const actions: LiveAction[] = [];

    // Email detection
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails) {
      actions.push({
        id: 'send-email',
        title: 'Send Email',
        description: `Email to ${emails[0]}`,
        icon: '📧',
        action: () => {
          window.open(`mailto:${emails[0]}`, '_blank');
          toast.success('Email client opened!');
          handleClose();
        },
        primary: true
      });
    }

    // URL detection
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlRegex);
    if (urls) {
      actions.push({
        id: 'open-url',
        title: 'Open Link',
        description: 'Open in browser',
        icon: '🔗',
        action: () => {
          window.open(urls[0], '_blank');
          toast.success('Link opened!');
          handleClose();
        },
        primary: true
      });
    }

    // Phone number detection
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const phones = text.match(phoneRegex);
    if (phones) {
      actions.push({
        id: 'call-phone',
        title: 'Call Number',
        description: `Call ${phones[0]}`,
        icon: '📞',
        action: () => {
          window.open(`tel:${phones[0]}`, '_blank');
          toast.success('Phone dialer opened!');
          handleClose();
        }
      });
    }

    // Address detection (simple)
    const addressRegex = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)/gi;
    const addresses = text.match(addressRegex);
    if (addresses) {
      actions.push({
        id: 'map-address',
        title: 'View on Map',
        description: 'Open in Google Maps',
        icon: '🗺️',
        action: () => {
          const encodedAddress = encodeURIComponent(addresses[0]);
          window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
          toast.success('Map opened!');
          handleClose();
        }
      });
    }

    // Code detection
    const codePatterns = [
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /import\s+.*from/,
      /class\s+\w+/,
      /<\w+.*>/
    ];
    const isCode = codePatterns.some(pattern => pattern.test(text));
    if (isCode) {
      actions.push({
        id: 'format-code',
        title: 'Format Code',
        description: 'Pretty print and format',
        icon: '💻',
        action: () => {
          // Copy formatted version back to clipboard
          navigator.clipboard.writeText(text.trim());
          toast.success('Code formatted!');
          handleClose();
        }
      });
    }

    // Always add copy action
    actions.push({
      id: 'copy-again',
      title: 'Copy Again',
      description: 'Copy to clipboard',
      icon: '📋',
      action: () => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
        handleClose();
      }
    });

    // Search action
    actions.push({
      id: 'search',
      title: 'Search Google',
      description: 'Search this content',
      icon: '🔍',
      action: () => {
        const query = encodeURIComponent(text.substring(0, 100));
        window.open(`https://google.com/search?q=${query}`, '_blank');
        toast.success('Search opened!');
        handleClose();
      }
    });

    return actions;
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Allow fade out animation
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-[9999] animate-slide-in-right`}>
      <Card className="w-80 bg-white shadow-2xl border-2 border-blue-200 animate-bounce-in">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <h3 className="font-semibold text-sm text-gray-800">Quick Actions</h3>
                <p className="text-xs text-gray-500">Choose an action for your copied content</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          </div>

          {/* Content Preview */}
          <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600 max-h-12 overflow-hidden">
            {content.length > 60 ? `${content.substring(0, 60)}...` : content}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {actions.slice(0, 4).map((action) => (
              <Button
                key={action.id}
                variant={action.primary ? "default" : "outline"}
                size="sm"
                onClick={action.action}
                className="w-full text-left justify-start hover:scale-105 transition-transform"
              >
                <span className="mr-2 text-base">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-75 truncate">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* More actions indicator */}
          {actions.length > 4 && (
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-500">
                +{actions.length - 4} more actions available
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};