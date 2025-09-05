import React, { useState } from 'react';
import { UserProfile } from './UserProfile';
import { ClipboardHistory } from './ClipboardHistory';
import { ActivityFeed } from './ActivityFeed';
import { SuggestionPanel } from './SuggestionPanel';
import { Header } from './Header';
import { UserSettings } from './UserSettings';
import { WebClipboardMonitor } from './WebClipboardMonitor';
import { useClipboardStore } from '../store/clipboardStore';
import { Button } from './ui/Button';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'activity'>('history');
  const [showSettings, setShowSettings] = useState(false);
  const { clearHistory, items } = useClipboardStore();

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all clipboard history? This action cannot be undone.')) {
      clearHistory();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - User Dashboard */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <UserProfile />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation with Clear History */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'history'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Clipboard History ({items.length})
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'activity'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Recent Activities
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  disabled={items.length === 0}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear History
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex">
            <div className="flex-1 p-6">
              {/* Web Clipboard Monitor - Shows at top */}
              <div className="mb-6">
                <WebClipboardMonitor />
              </div>
              
              {activeTab === 'history' ? <ClipboardHistory /> : <ActivityFeed />}
            </div>
            
            {/* Right Sidebar - Smart Suggestions */}
            <div className="w-80 bg-white border-l border-gray-200">
              <SuggestionPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <UserSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};