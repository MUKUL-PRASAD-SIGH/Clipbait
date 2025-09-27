import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  TrashIcon, 
  ArrowLeftIcon, 
  XMarkIcon,
  DocumentDuplicateIcon 
} from '@heroicons/react/24/outline';
import { useClipboardStore } from '../store/clipboardStore';
import { Button } from './ui/Button';
import { ConfirmationModal } from './ui/ConfirmationModal';

interface RecycleBinProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecycleBin({ isOpen, onClose }: RecycleBinProps) {
  const { deletedItems, restoreItem, permanentlyDeleteItem, emptyRecycleBin } = useClipboardStore();
  const [showEmptyConfirmation, setShowEmptyConfirmation] = React.useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrashIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recycle Bin
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {deletedItems.length} items
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {deletedItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmptyConfirmation(true)}
                  className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Empty Bin
                </Button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {deletedItems.length === 0 ? (
            <div className="text-center py-12">
              <TrashIcon className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                Recycle bin is empty
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Deleted clipboard items will appear here and can be restored.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {deletedItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          Deleted
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(item.deletedAt || item.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {truncateContent(item.content)}
                      </p>
                      
                      {item.entities && item.entities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.entities.slice(0, 3).map((entity, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
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
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => restoreItem(item.id)}
                        className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                        title="Restore item"
                      >
                        <ArrowLeftIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirmation(item.id)}
                        className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete permanently"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Items in recycle bin are stored locally and will be lost if you clear browser data.
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Empty Bin Confirmation */}
      <ConfirmationModal
        isOpen={showEmptyConfirmation}
        onClose={() => setShowEmptyConfirmation(false)}
        onConfirm={emptyRecycleBin}
        title="Empty Recycle Bin"
        message={`Are you sure you want to permanently delete all ${deletedItems.length} items in the recycle bin? This action cannot be undone.`}
        confirmText="Empty Bin"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Permanent Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(null)}
        onConfirm={() => {
          if (showDeleteConfirmation) {
            permanentlyDeleteItem(showDeleteConfirmation);
          }
        }}
        title="Delete Permanently"
        message="Are you sure you want to permanently delete this item? This action cannot be undone."
        confirmText="Delete Forever"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}