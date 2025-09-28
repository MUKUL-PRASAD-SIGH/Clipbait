import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  TrashIcon, 
  ArrowLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useClipboardStore } from '../store/clipboardStore';

interface RecycleBinHoverProps {
  isVisible: boolean;
  onViewAll: () => void;
}

export function RecycleBinHover({ isVisible, onViewAll }: RecycleBinHoverProps) {
  const { deletedItems, restoreItem } = useClipboardStore();

  if (!isVisible || deletedItems.length === 0) return null;

  const truncateContent = (content: string, maxLength: number = 40) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Show only the 5 most recently deleted items
  const recentItems = deletedItems.slice(0, 5);

  return (
    <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrashIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Recently Deleted
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {deletedItems.length} items
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="max-h-64 overflow-y-auto">
        {recentItems.map((item) => (
          <div
            key={item.id}
            className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100 mb-1 leading-tight">
                  {truncateContent(item.content)}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(item.deletedAt || item.createdAt), { addSuffix: true })}
                  </span>
                  {item.entities && item.entities.length > 0 && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {item.entities.length} entities
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restoreItem(item.id);
                }}
                className="ml-2 p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                title="Restore item"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onViewAll}
          className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <EyeIcon className="h-4 w-4" />
          <span>View All ({deletedItems.length})</span>
        </button>
      </div>
    </div>
  );
}