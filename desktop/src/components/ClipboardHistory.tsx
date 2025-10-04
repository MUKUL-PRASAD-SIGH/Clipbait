import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TrashIcon, DocumentDuplicateIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useClipboardStore } from '../store/clipboardStore';
// ClipboardItem type is used in the component
import { invoke } from '@tauri-apps/api/tauri';

export function ClipboardHistory() {
  const { 
    items, 
    selectedItem, 
    searchQuery, 
    isLoading, 
    selectItem, 
    deleteItem 
  } = useClipboardStore();

  const filteredItems = useMemo(() => {
    // Ensure items is always an array
    const safeItems = Array.isArray(items) ? items : [];
    if (!searchQuery) return safeItems;
    return safeItems.filter(item => 
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.entities.some(entity => 
        entity.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [items, searchQuery]);

  const handleCopyToClipboard = async (content: string) => {
    try {
      await invoke('set_clipboard_text', { text: content });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      contact: 'bg-blue-100 text-blue-800',
      event: 'bg-green-100 text-green-800',
      location: 'bg-red-100 text-red-800',
      document: 'bg-yellow-100 text-yellow-800',
      code: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 tracking-wide uppercase">
          Clipboard History ({filteredItems.length})
        </h2>
        {searchQuery && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showing results for "{searchQuery}"
          </p>
        )}
      </div>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No clipboard items</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No items match your search.' : 'Copy something to get started!'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              draggable={true}
              onDragStart={(e) => {
                const dragData = {
                  id: item.id,
                  content: item.content,
                  type: 'clipboard-item'
                };
                console.log('ClipboardHistory: Starting drag with data:', dragData);
                e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
                e.dataTransfer.effectAllowed = 'copy';
                // Add visual feedback
                e.currentTarget.style.opacity = '0.5';
              }}
              onDragEnd={(e) => {
                // Reset visual feedback
                e.currentTarget.style.opacity = '1';
              }}
              className={`border rounded-lg p-4 cursor-pointer transition-colors hover:shadow-md ${
                selectedItem?.id === item.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
              onClick={() => {
                console.log('ClipboardHistory: Selecting item:', item.id, item.content.substring(0, 50));
                selectItem(item);
              }}
              title="Drag to Smart Actions panel or click to select"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1">
                    <Bars3Icon className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing" title="Drag to Smart Actions" />
                  </div>
                  <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.metadata.category)}`}>
                      {item.metadata.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.createdAt && !isNaN(new Date(item.createdAt).getTime()) 
                        ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                        : 'Unknown time'
                      }
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                    {truncateContent(item.content)}
                  </p>
                  
                  {item.entities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.entities.slice(0, 3).map((entity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {entity.type}: {entity.value}
                        </span>
                      ))}
                      {item.entities.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{item.entities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {item.suggestions.length > 0 && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                      {item.suggestions.length} suggestion{item.suggestions.length !== 1 ? 's' : ''} available
                    </p>
                  )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyToClipboard(item.content);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    title="Copy to clipboard"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      console.log('Delete button clicked for item:', item.id);
                      console.log('Auth token:', localStorage.getItem('auth_token'));
                      console.log('API Base URL:', 'http://localhost:3000/api');
                      
                      // Test if API is reachable
                      try {
                        const response = await fetch('http://localhost:3002/health');
                        console.log('Health check response:', response.status);
                        if (response.ok) {
                          const data = await response.json();
                          console.log('Health check data:', data);
                        }
                      } catch (healthError) {
                        console.error('Health check failed - backend may not be running:', healthError);
                        console.log('Make sure backend is running on port 3002: cd backend && npm run dev');
                      }
                      
                      deleteItem(item.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                    title="Delete item"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}