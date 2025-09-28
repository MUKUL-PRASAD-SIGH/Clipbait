import { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  CalendarIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  UserPlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
  LinkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useClipboardStore } from '../store/clipboardStore';
import { ActionSuggestion, ActionType } from '../types';
// Remove shell import as we'll use window.open for web compatibility
import { LoadingSpinner } from './ui/LoadingSpinner';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  confidence: number;
}

export function SuggestionPanel() {
  const { selectedItem, suggestions, executeSuggestion, selectItem, items, addClipboardItem } = useClipboardStore();
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loadingQuickActions, setLoadingQuickActions] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    console.log('SuggestionPanel: selectedItem changed:', selectedItem);
    if (selectedItem) {
      console.log('SuggestionPanel: Generating quick actions for:', selectedItem.content.substring(0, 50));
      generateQuickActions(selectedItem.content);
    } else {
      console.log('SuggestionPanel: No item selected, clearing actions');
      setQuickActions([]);
    }
  }, [selectedItem]);

  const generateQuickActions = (content: string) => {
    console.log('SuggestionPanel: generateQuickActions called with content:', content.substring(0, 100));
    setLoadingQuickActions(true);
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
        action: () => executeQuickAction('email', { email }),
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
        action: () => executeQuickAction('call', { phone }),
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
        action: () => executeQuickAction('open_url', { url }),
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
        action: () => executeQuickAction('calendar', { content }),
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
        action: () => executeQuickAction('maps', { address: content }),
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
        action: () => executeQuickAction('summarize', { content }),
        confidence: 0.75
      });
    }

    if (content.length > 20) {
      detectedActions.push({
        id: 'create_todo',
        title: 'Create Task',
        description: 'Add to todo list',
        icon: <ListBulletIcon className="h-4 w-4" />,
        action: () => executeQuickAction('todo', { content }),
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
        icon: <UserPlusIcon className="h-4 w-4" />,
        action: () => executeQuickAction('contact', { content }),
        confidence: 0.65
      });
    }

    // AI enhancement action
    detectedActions.push({
      id: 'ai_enhance',
      title: 'AI Enhance',
      description: 'Improve with AI',
      icon: <SparklesIcon className="h-4 w-4" />,
      action: () => executeQuickAction('ai_enhance', { content }),
      confidence: 0.60
    });

    // Sort by confidence and take top 6
    const sortedActions = detectedActions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);

    console.log('SuggestionPanel: Generated', sortedActions.length, 'quick actions:', sortedActions.map(a => a.title));
    setQuickActions(sortedActions);
    setLoadingQuickActions(false);
  };

  const executeQuickAction = async (actionType: string, params: any) => {
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
          const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(params.content)}`;
          window.open(calendarUrl, '_blank');
          break;
        case 'summarize':
          const summary = params.content.split('.').slice(0, 2).join('.') + '.';
          navigator.clipboard.writeText(`Summary: ${summary}`);
          alert('Summary copied to clipboard!');
          break;
        case 'todo':
          const task = `TODO: ${params.content.substring(0, 100)}${params.content.length > 100 ? '...' : ''}`;
          navigator.clipboard.writeText(task);
          alert('Task copied to clipboard!');
          break;
        case 'contact':
          const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${params.content}\nEND:VCARD`;
          navigator.clipboard.writeText(vcard);
          alert('Contact vCard copied to clipboard!');
          break;
        case 'ai_enhance':
          const enhanced = `Enhanced: ${params.content}\n\nThis content has been formatted for better readability.`;
          navigator.clipboard.writeText(enhanced);
          alert('Enhanced content copied to clipboard!');
          break;
      }
    } catch (error) {
      console.error('Error executing quick action:', error);
    } finally {
      setSelectedAction(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    console.log('SuggestionPanel: Drag over detected');
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only hide drag overlay if leaving the main container
    if (e.currentTarget === e.target) {
      console.log('SuggestionPanel: Drag leave detected');
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    console.log('SuggestionPanel: Drop detected');
    
    try {
      const rawData = e.dataTransfer.getData('text/plain');
      console.log('SuggestionPanel: Raw drop data:', rawData);
      
      const data = JSON.parse(rawData);
      console.log('SuggestionPanel: Parsed drop data:', data);
      
      if (data.type === 'clipboard-item') {
        // Find the item and select it
        const item = items.find(i => i.id === data.id);
        console.log('SuggestionPanel: Found item to select:', item);
        
        if (item) {
          console.log('SuggestionPanel: Selecting item:', item.id);
          selectItem(item);
        } else {
          console.log('SuggestionPanel: Item not found in items array');
        }
      } else {
        console.log('SuggestionPanel: Drop data is not a clipboard item');
      }
    } catch (error) {
      console.error('SuggestionPanel: Error handling drop:', error);
    }
  };

  const getActionIcon = (type: ActionType) => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (type) {
      case 'open_maps':
        return <MapPinIcon {...iconProps} />;
      case 'create_event':
        return <CalendarIcon {...iconProps} />;
      case 'call_phone':
        return <PhoneIcon {...iconProps} />;
      case 'send_email':
        return <EnvelopeIcon {...iconProps} />;
      case 'open_url':
        return <GlobeAltIcon {...iconProps} />;
      case 'add_contact':
        return <UserPlusIcon {...iconProps} />;
      case 'create_note':
        return <DocumentTextIcon {...iconProps} />;
      case 'search_web':
        return <MagnifyingGlassIcon {...iconProps} />;
      default:
        return <DocumentTextIcon {...iconProps} />;
    }
  };

  const handleSuggestionClick = async (suggestion: ActionSuggestion) => {
    try {
      // Handle different action types using window.open for web compatibility
      switch (suggestion.type) {
        case 'open_url':
          window.open(suggestion.metadata.url, '_blank');
          break;
        case 'open_maps':
          const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(suggestion.metadata.address)}`;
          window.open(mapsUrl, '_blank');
          break;
        case 'send_email':
          const emailUrl = `mailto:${suggestion.metadata.email}`;
          window.open(emailUrl, '_blank');
          break;
        case 'call_phone':
          const telUrl = `tel:${suggestion.metadata.phone}`;
          window.open(telUrl, '_blank');
          break;
        case 'search_web':
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(suggestion.metadata.query)}`;
          window.open(searchUrl, '_blank');
          break;
        default:
          // For other actions, call the backend
          await executeSuggestion(suggestion);
      }
    } catch (error) {
      console.error('Failed to execute suggestion:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-700';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div 
      className={`p-6 h-full bg-white dark:bg-gray-800 transition-all duration-200 relative ${
        isDragOver 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400' 
          : 'border-2 border-transparent'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-100/50 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-blue-600 dark:text-blue-400 text-lg font-medium">Drop here to analyze</div>
            <div className="text-blue-500 dark:text-blue-300 text-sm">Release to see smart actions</div>
          </div>
        </div>
      )}
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          Smart Actions
        </h3>
      </div>

      {!selectedItem ? (
        <div className="text-center py-12">
          <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <svg className={`h-8 w-8 transition-colors ${
              isDragOver ? 'text-blue-600' : 'text-gray-400'
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h4 className={`mt-4 text-sm font-medium transition-colors ${
            isDragOver ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {isDragOver ? 'Drop here to analyze' : 'Select an item'}
          </h4>
          <p className={`mt-2 text-sm transition-colors ${
            isDragOver ? 'text-blue-700' : 'text-gray-500'
          }`}>
            {isDragOver 
              ? 'Release to see smart actions for this item' 
              : 'Choose a clipboard item to see smart action suggestions'
            }
          </p>
          {!isDragOver && (
            <div className="mt-4 space-y-3">
              <div className="text-xs text-gray-400">
                💡 Drag items here or copy phone numbers, emails, addresses, or dates to see magic happen!
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
                Drag clipboard items here to analyze them
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log('Adding test email item');
                    addClipboardItem('Contact john.doe@example.com for the meeting at 2 PM');
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Test with Email
                </button>
                <button
                  onClick={() => {
                    console.log('Adding test phone item');
                    addClipboardItem('Call me at (555) 123-4567 when you get this message');
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  Test with Phone
                </button>
              </div>
            </div>
          )}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h4 className="mt-4 text-sm font-medium text-gray-900">No smart actions found</h4>
          <p className="mt-2 text-sm text-gray-500">
            This content doesn't contain recognizable patterns
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Try copying: phone numbers, email addresses, URLs, dates, or addresses
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Actions Section */}
          {quickActions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <SparklesIcon className="h-4 w-4 mr-2 text-blue-600" />
                Quick Actions
              </h4>
              {loadingQuickActions ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      disabled={selectedAction === action.id}
                      className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50"
                    >
                      {selectedAction === action.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <div className="text-blue-600 mb-1">{action.icon}</div>
                          <span className="text-xs font-medium text-gray-900 text-center">{action.title}</span>
                          <span className="text-xs text-gray-500 text-center">{action.description}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Smart Suggestions Section */}
          {suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Smart Suggestions
              </h4>
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md transition-all duration-200 group transform hover:scale-[1.02]"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                        {getActionIcon(suggestion.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 group-hover:text-indigo-900 mb-1">
                          {suggestion.title}
                        </p>
                        <p className="text-sm text-gray-600 group-hover:text-indigo-700 mb-3">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getConfidenceColor(suggestion.confidence)}`}>
                            {Math.round(suggestion.confidence * 100)}% match
                          </span>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedItem && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Item Details</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 text-gray-900">{selectedItem.contentType}</span>
            </div>
            <div>
              <span className="text-gray-500">Category:</span>
              <span className="ml-2 text-gray-900">{selectedItem.metadata.category}</span>
            </div>
            <div>
              <span className="text-gray-500">Entities:</span>
              <span className="ml-2 text-gray-900">{selectedItem.entities.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Confidence:</span>
              <span className={`ml-2 font-medium ${getConfidenceColor(selectedItem.metadata.confidence)}`}>
                {Math.round(selectedItem.metadata.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}