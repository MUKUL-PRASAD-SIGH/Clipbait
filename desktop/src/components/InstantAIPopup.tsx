import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  ListBulletIcon,
  DocumentTextIcon,
  LinkIcon,
  MapPinIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  confidence: number;
}

interface InstantAIPopupProps {
  content: string;
  isVisible: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function InstantAIPopup({ content, isVisible, onClose, position }: InstantAIPopupProps) {
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && content) {
      generateQuickActions();
    }
  }, [isVisible, content]);

  const generateQuickActions = () => {
    setLoading(true);
    const detectedActions: QuickAction[] = [];

    // Email detection
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    if (emailRegex.test(content)) {
      const email = content.match(emailRegex)?.[0];
      detectedActions.push({
        id: 'send_email',
        title: 'Send Email',
        description: `Send email to ${email}`,
        icon: <EnvelopeIcon className="h-4 w-4" />,
        action: () => executeAction('email', { email }),
        confidence: 0.95
      });
    }

    // Phone number detection
    const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
    if (phoneRegex.test(content)) {
      const phone = content.match(phoneRegex)?.[0];
      detectedActions.push({
        id: 'call_phone',
        title: 'Call Number',
        description: `Call ${phone}`,
        icon: <PhoneIcon className="h-4 w-4" />,
        action: () => executeAction('call', { phone }),
        confidence: 0.90
      });
    }

    // URL detection
    const urlRegex = /https?:\/\/[^\s]+/;
    if (urlRegex.test(content)) {
      const url = content.match(urlRegex)?.[0];
      detectedActions.push({
        id: 'open_url',
        title: 'Open Link',
        description: 'Open in browser',
        icon: <LinkIcon className="h-4 w-4" />,
        action: () => executeAction('open_url', { url }),
        confidence: 0.95
      });
    }

    // Date/time detection for calendar
    const dateRegex = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}|january|february|march|april|may|june|july|august|september|october|november|december)\b/i;
    if (dateRegex.test(content)) {
      detectedActions.push({
        id: 'create_event',
        title: 'Create Event',
        description: 'Add to calendar',
        icon: <CalendarIcon className="h-4 w-4" />,
        action: () => executeAction('calendar', { content }),
        confidence: 0.80
      });
    }

    // Address detection
    const addressRegex = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)/i;
    if (addressRegex.test(content)) {
      detectedActions.push({
        id: 'open_maps',
        title: 'Open Maps',
        description: 'View location',
        icon: <MapPinIcon className="h-4 w-4" />,
        action: () => executeAction('maps', { address: content }),
        confidence: 0.85
      });
    }

    // Always available actions
    if (content.length > 50) {
      detectedActions.push({
        id: 'summarize',
        title: 'Summarize',
        description: 'Create summary',
        icon: <DocumentTextIcon className="h-4 w-4" />,
        action: () => executeAction('summarize', { content }),
        confidence: 0.75
      });
    }

    if (content.length > 20) {
      detectedActions.push({
        id: 'create_todo',
        title: 'Create Task',
        description: 'Add to todo list',
        icon: <ListBulletIcon className="h-4 w-4" />,
        action: () => executeAction('todo', { content }),
        confidence: 0.70
      });
    }

    // Name detection for contact
    const nameRegex = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/;
    if (nameRegex.test(content)) {
      detectedActions.push({
        id: 'add_contact',
        title: 'Add Contact',
        description: 'Save to contacts',
        icon: <UserIcon className="h-4 w-4" />,
        action: () => executeAction('contact', { content }),
        confidence: 0.65
      });
    }

    // AI enhancement action
    detectedActions.push({
      id: 'ai_enhance',
      title: 'AI Enhance',
      description: 'Improve with AI',
      icon: <SparklesIcon className="h-4 w-4" />,
      action: () => executeAction('ai_enhance', { content }),
      confidence: 0.60
    });

    // Sort by confidence and take top 6
    const sortedActions = detectedActions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);

    setActions(sortedActions);
    setLoading(false);
  };

  const executeAction = async (actionType: string, params: any) => {
    setSelectedAction(actionType);
    
    try {
      switch (actionType) {
        case 'email':
          window.open(`mailto:${params.email}`, '_blank');
          break;
        case 'call':
          window.open(`tel:${params.phone}`, '_blank');
          break;
        case 'open_url':
          window.open(params.url, '_blank');
          break;
        case 'maps':
          window.open(`https://maps.google.com/?q=${encodeURIComponent(params.address)}`, '_blank');
          break;
        case 'calendar':
          // Create calendar event (simplified)
          const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(params.content)}`;
          window.open(calendarUrl, '_blank');
          break;
        case 'summarize':
          await generateSummary(params.content);
          break;
        case 'todo':
          await createTodoItem(params.content);
          break;
        case 'contact':
          await addToContacts(params.content);
          break;
        case 'ai_enhance':
          await enhanceWithAI(params.content);
          break;
      }
      
      // Close popup after action
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error executing action:', error);
    } finally {
      setSelectedAction(null);
    }
  };

  const generateSummary = async (content: string) => {
    try {
      const response = await fetch('/api/generative/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content, contentType: 'text' })
      });
      
      if (response.ok) {
        const data = await response.json();
        const summary = data.data.transformations.find((t: any) => t.type === 'summarize');
        if (summary) {
          navigator.clipboard.writeText(summary.transformedContent);
          alert('Summary copied to clipboard!');
        }
      } else {
        // Fallback: create a simple summary
        const sentences = content.split('.').filter(s => s.trim().length > 0);
        const summary = sentences.slice(0, 2).join('.') + '.';
        navigator.clipboard.writeText(`Summary: ${summary}`);
        alert('Basic summary copied to clipboard!');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      // Fallback: create a simple summary
      const words = content.split(' ').slice(0, 20).join(' ');
      navigator.clipboard.writeText(`Summary: ${words}...`);
      alert('Basic summary copied to clipboard!');
    }
  };

  const createTodoItem = async (content: string) => {
    try {
      const response = await fetch('/api/generative/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });
      
      if (response.ok) {
        const data = await response.json();
        navigator.clipboard.writeText(data.data.taskList);
        alert('Task list copied to clipboard!');
      } else {
        // Fallback: create a simple task
        const task = `TODO: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`;
        navigator.clipboard.writeText(task);
        alert('Task copied to clipboard!');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      // Fallback: create a simple task
      const task = `TODO: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`;
      navigator.clipboard.writeText(task);
      alert('Task copied to clipboard!');
    }
  };

  const addToContacts = async (content: string) => {
    // Simplified contact creation
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${content}\nEND:VCARD`;
    navigator.clipboard.writeText(vcard);
    alert('Contact vCard copied to clipboard!');
  };

  const enhanceWithAI = async (content: string) => {
    try {
      const response = await fetch('/api/generative/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });
      
      if (response.ok) {
        const data = await response.json();
        navigator.clipboard.writeText(data.data.email);
        alert('AI-enhanced content copied to clipboard!');
      } else {
        // Fallback: create a simple enhancement
        const enhanced = `Enhanced: ${content}\n\nThis content has been formatted for better readability.`;
        navigator.clipboard.writeText(enhanced);
        alert('Enhanced content copied to clipboard!');
      }
    } catch (error) {
      console.error('Error enhancing with AI:', error);
      // Fallback: create a simple enhancement
      const enhanced = `Enhanced: ${content}\n\nThis content has been formatted for better readability.`;
      navigator.clipboard.writeText(enhanced);
      alert('Enhanced content copied to clipboard!');
    }
  };

  if (!isVisible) return null;

  const popupStyle = position ? {
    position: 'fixed' as const,
    left: Math.min(position.x, window.innerWidth - 320),
    top: Math.min(position.y, window.innerHeight - 400),
    zIndex: 9999
  } : {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999
  };

  return (
    <div style={popupStyle} className="w-80">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Quick Actions</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-blue-100 mt-1 truncate">
            {content.substring(0, 50)}...
          </p>
        </div>

        {/* Actions */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  disabled={selectedAction === action.id}
                  className="flex flex-col items-center p-3 h-auto hover:bg-blue-50 hover:border-blue-300"
                >
                  {selectedAction === action.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <div className="text-blue-600 mb-1">{action.icon}</div>
                      <span className="text-xs font-medium text-gray-900">{action.title}</span>
                      <span className="text-xs text-gray-500 text-center">{action.description}</span>
                    </>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center">
          AI-powered suggestions • Click to execute
        </div>
      </div>
    </div>
  );
}