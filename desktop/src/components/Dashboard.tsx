import React, { useState } from 'react';
import { UserProfile } from './UserProfile';
import { ClipboardHistory } from './ClipboardHistory';
import { ActivityFeed } from './ActivityFeed';
import { SuggestionPanel } from './SuggestionPanel';
import { Header } from './Header';
import { useClipboardStore } from '../store/clipboardStore';
import { Button } from './ui/Button';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'activity'>('history');
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
              
              {/* Clear History Button */}
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

          {/* Content */}
          <div className="flex-1 flex">
            <div className="flex-1 p-6">
              {activeTab === 'history' ? <ClipboardHistory /> : <ActivityFeed />}
            </div>
            
            {/* Right Sidebar - Smart Suggestions */}
            <div className="w-80 bg-white border-l border-gray-200">
              <SuggestionPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};