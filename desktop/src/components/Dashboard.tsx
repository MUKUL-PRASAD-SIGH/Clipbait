import React, { useState } from 'react';
import { CogIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ClipboardHistory } from './ClipboardHistory';
import { ActivityFeed } from './ActivityFeed';
import { SuggestionPanel } from './SuggestionPanel';
import { Header } from './Header';
import { UserSettings } from './UserSettings';
import { WebClipboardMonitor } from './WebClipboardMonitor';
import { useClipboardStore } from '../store/clipboardStore';
import { Button } from './ui/Button';
import { ConfirmationModal } from './ui/ConfirmationModal';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'activity'>('history');
  const [showSettings, setShowSettings] = useState(false);
  const [showMoveToRecycleBinConfirmation, setShowMoveToRecycleBinConfirmation] = useState(false);
  const { moveAllToRecycleBin, items } = useClipboardStore();

  const handleMoveAllToRecycleBin = () => {
    moveAllToRecycleBin();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Left Sidebar - Clipboard History */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Clipboard History
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {items.length} items
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <CogIcon className="w-4 h-4" />
                <span>Settings</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMoveToRecycleBinConfirmation(true)}
                className="text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-500 flex items-center gap-2"
                disabled={items.length === 0}
              >
                <TrashIcon className="w-4 h-4" />
                <span>Move to Bin</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ClipboardHistory />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-full">
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                Web Monitor
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'activity'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                Recent Activities
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 space-y-6">
              {activeTab === 'history' ? (
                /* Web Clipboard Monitor Card */
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-gray-300 dark:hover:border-gray-600">
                  <WebClipboardMonitor />
                </div>
              ) : (
                /* Activity Feed Card */
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex-1 min-h-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-gray-300 dark:hover:border-gray-600">
                  <div className="h-full">
                    <ActivityFeed />
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Smart Suggestions */}
            <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
              <SuggestionPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <UserSettings onClose={() => setShowSettings(false)} />
      )}

      {/* Move to Recycle Bin Confirmation Modal */}
      <ConfirmationModal
        isOpen={showMoveToRecycleBinConfirmation}
        onClose={() => setShowMoveToRecycleBinConfirmation(false)}
        onConfirm={handleMoveAllToRecycleBin}
        title="Move All to Recycle Bin"
        message={`Are you sure you want to move all ${items.length} clipboard items to the recycle bin? You can restore them later from the recycle bin.`}
        confirmText="Move to Bin"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
};