import { useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useClipboardStore } from '../store/clipboardStore';
import { ClipboardItem } from '../types';
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
    if (!searchQuery) return items;
    return items.filter(item => 
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
        <h2 className="text-lg font-medium text-gray-900">
          Clipboard History ({filteredItems.length})
        </h2>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-1">
            Showing results for "{searchQuery}"
          </p>
        )}
      </div>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No clipboard items</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'No items match your search.' : 'Copy something to get started!'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedItem?.id === item.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => selectItem(item)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.metadata.category)}`}>
                      {item.metadata.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 mb-2">
                    {truncateContent(item.content)}
                  </p>
                  
                  {item.entities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.entities.slice(0, 3).map((entity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                        >
                          {entity.type}: {entity.value}
                        </span>
                      ))}
                      {item.entities.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{item.entities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {item.suggestions.length > 0 && (
                    <p className="text-xs text-indigo-600">
                      {item.suggestions.length} suggestion{item.suggestions.length !== 1 ? 's' : ''} available
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyToClipboard(item.content);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Copy to clipboard"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
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