import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentListIcon, 
  PlusIcon, 
  XMarkIcon, 
  SparklesIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { StagingArea as StagingAreaType, ClipboardItem, SmartPasteFormat } from '../../../shared/types';

interface StagingAreaProps {
  isOpen: boolean;
  onClose: () => void;
  onPaste: (format: SmartPasteFormat) => void;
}

export function StagingArea({ isOpen, onClose, onPaste }: StagingAreaProps) {
  const [stagingArea, setStagingArea] = useState<StagingAreaType | null>(null);
  const [smartFormats, setSmartFormats] = useState<SmartPasteFormat[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<SmartPasteFormat | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStagingArea();
    }
  }, [isOpen]);

  useEffect(() => {
    if (stagingArea && stagingArea.items.length > 0) {
      generateSmartFormats();
    }
  }, [stagingArea]);

  const loadStagingArea = async () => {
    try {
      const response = await fetch('/api/staging', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStagingArea(data.data);
      }
    } catch (error) {
      console.error('Error loading staging area:', error);
    }
  };

  const addItemToStaging = async (item: ClipboardItem) => {
    try {
      const response = await fetch('/api/staging/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ item })
      });

      if (response.ok) {
        const data = await response.json();
        setStagingArea(data.data);
      }
    } catch (error) {
      console.error('Error adding item to staging:', error);
    }
  };

  const removeItemFromStaging = async (itemId: string) => {
    try {
      const response = await fetch(`/api/staging/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStagingArea(data.data);
      }
    } catch (error) {
      console.error('Error removing item from staging:', error);
    }
  };

  const generateSmartFormats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/staging/smart-paste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        setSmartFormats(data.data.formats || []);
        if (data.data.formats.length > 0) {
          setSelectedFormat(data.data.formats[0]);
        }
      }
    } catch (error) {
      console.error('Error generating smart formats:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearStaging = async () => {
    try {
      const response = await fetch('/api/staging', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setStagingArea(null);
        setSmartFormats([]);
        setSelectedFormat(null);
      }
    } catch (error) {
      console.error('Error clearing staging area:', error);
    }
  };

  const getTargetFormatIcon = (format: StagingAreaType['targetFormat']) => {
    switch (format) {
      case 'contact':
        return <UserIcon className="h-5 w-5" />;
      case 'email':
        return <EnvelopeIcon className="h-5 w-5" />;
      case 'document':
        return <DocumentTextIcon className="h-5 w-5" />;
      default:
        return <ClipboardDocumentListIcon className="h-5 w-5" />;
    }
  };

  const getFormatLabel = (format: SmartPasteFormat['format']) => {
    switch (format) {
      case 'plain':
        return 'Plain Text';
      case 'rich':
        return 'Rich Text';
      case 'markdown':
        return 'Markdown';
      case 'html':
        return 'HTML';
      case 'citation':
        return 'Citation';
      default:
        return 'Custom';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Staging Area</h2>
                <p className="text-sm text-gray-600">Combine multiple clipboard items for smart pasting</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Staged Items */}
          <div className="w-1/2 border-r border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Staged Items</h3>
              {stagingArea && (
                <div className="flex items-center text-sm text-gray-500">
                  {getTargetFormatIcon(stagingArea.targetFormat)}
                  <span className="ml-1 capitalize">{stagingArea.targetFormat}</span>
                </div>
              )}
            </div>

            {!stagingArea || stagingArea.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No items in staging area</p>
                <p className="text-sm">Copy items to add them here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stagingArea.items.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">
                            {index + 1}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {item.contentType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 line-clamp-3">
                          {item.content}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItemFromStaging(item.id)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {stagingArea && stagingArea.items.length > 0 && (
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearStaging}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={generateSmartFormats}
                  disabled={loading}
                  className="flex items-center"
                >
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  Generate Formats
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel - Smart Paste Formats */}
          <div className="w-1/2 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Smart Paste Formats</h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : smartFormats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No formats available</p>
                <p className="text-sm">Add items to staging area to generate formats</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Format Selector */}
                <div className="flex space-x-2 mb-4">
                  {smartFormats.map((format, index) => (
                    <Button
                      key={index}
                      variant={selectedFormat === format ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFormat(format)}
                      className="flex items-center"
                    >
                      {getFormatLabel(format.format)}
                      <span className="ml-2 text-xs opacity-75">
                        {Math.round(format.confidence * 100)}%
                      </span>
                    </Button>
                  ))}
                </div>

                {/* Preview */}
                {selectedFormat && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Preview</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>Confidence: {Math.round(selectedFormat.confidence * 100)}%</span>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded p-3 max-h-48 overflow-y-auto">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                        {selectedFormat.content}
                      </pre>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button
                        onClick={() => onPaste(selectedFormat)}
                        className="flex items-center"
                      >
                        <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
                        Copy to Clipboard
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedFormat.content);
                          onClose();
                        }}
                      >
                        Copy & Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}