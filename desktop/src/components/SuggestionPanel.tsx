import { 
  MapPinIcon, 
  CalendarIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  UserPlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useClipboardStore } from '../store/clipboardStore';
import { ActionSuggestion, ActionType } from '../types';
import { shell } from '@tauri-apps/api';

export function SuggestionPanel() {
  const { selectedItem, suggestions, executeSuggestion } = useClipboardStore();

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
      // Handle different action types
      switch (suggestion.type) {
        case 'open_url':
          await shell.open(suggestion.metadata.url);
          break;
        case 'open_maps':
          const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(suggestion.metadata.address)}`;
          await shell.open(mapsUrl);
          break;
        case 'send_email':
          const emailUrl = `mailto:${suggestion.metadata.email}`;
          await shell.open(emailUrl);
          break;
        case 'call_phone':
          const telUrl = `tel:${suggestion.metadata.phone}`;
          await shell.open(telUrl);
          break;
        case 'search_web':
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(suggestion.metadata.query)}`;
          await shell.open(searchUrl);
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
    <div className="p-6 h-full bg-white">
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
          <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h4 className="mt-4 text-sm font-medium text-gray-900">Select an item</h4>
          <p className="mt-2 text-sm text-gray-500">
            Choose a clipboard item to see smart action suggestions
          </p>
          <div className="mt-4 text-xs text-gray-400">
            💡 Copy phone numbers, emails, addresses, or dates to see magic happen!
          </div>
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