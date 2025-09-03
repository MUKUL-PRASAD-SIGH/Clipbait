import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useClipboardStore } from '../store/clipboardStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { items, clearHistory, getTotalItems, getItemsToday } = useClipboardStore();

  const totalItems = getTotalItems();
  const todayItems = getItemsToday();
  const storageUsed = items.reduce((acc, item) => acc + item.content.length, 0);

  return (
    <div className="p-6 space-y-6">
      {/* User Info */}
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-semibold text-primary-600">
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {user?.displayName || 'User'}
        </h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
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
            onClick={() => {/* TODO: Settings */}}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Button>
        </div>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full"
        onClick={logout}
      >
        Sign Out
      </Button>
    </div>
  );
};