import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useClipboardStore } from '../store/clipboardStore';
import { Button } from './ui/Button';
import { Card, CardBadge } from './ui/Card';
import { UserSettings } from './UserSettings';

export const UserProfile: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items, clearHistory } = useClipboardStore();
  const [showSettings, setShowSettings] = useState(false);

  const totalItems = items.length;
  const todayItems = items.filter(item => {
    const today = new Date().toDateString();
    return new Date(item.timestamp).toDateString() === today;
  }).length;
  const storageUsed = items.reduce((acc, item) => acc + item.content.length, 0);

  return (
    <div className="p-6 space-y-6">
      {/* User Info */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-semibold text-white">
            {isAuthenticated 
              ? (user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U')
              : '👤'
            }
          </span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {isAuthenticated ? (user?.displayName || user?.email?.split('@')[0] || 'User') : 'Guest User'}
        </h2>
        <p className="text-sm text-gray-500">
          {isAuthenticated ? user?.email : 'Using MVP mode'}
        </p>
        <div className="mt-2">
          <CardBadge variant={isAuthenticated ? 'success' : 'warning'}>
            {isAuthenticated ? '🟢 Authenticated' : '🟡 Guest Mode'}
          </CardBadge>
        </div>
      </div>

      {/* Stats */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Items</span>
            <span className="text-sm font-medium text-gray-900">{totalItems}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Today</span>
            <span className="text-sm font-medium text-gray-900">{todayItems}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Storage Used</span>
            <span className="text-sm font-medium text-gray-900">
              {(storageUsed / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={clearHistory}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear History
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => {/* TODO: Export functionality */}}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => setShowSettings(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Button>
        </div>
      </Card>

      {/* Authentication Actions */}
      {isAuthenticated ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={logout}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </Button>
      ) : (
        <div className="space-y-2">
          <Button
            variant="gradient"
            className="w-full"
            onClick={() => {/* TODO: Show login */}}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Sign in to sync across devices
          </p>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <UserSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};