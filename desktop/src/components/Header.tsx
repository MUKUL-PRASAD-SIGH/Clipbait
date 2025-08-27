import { useState } from 'react';
import { MagnifyingGlassIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { useClipboardStore } from '../store/clipboardStore';

export function Header() {
  const { user, logout } = useAuthStore();
  const { searchQuery, setSearchQuery } = useClipboardStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Epitychia</h1>
            <span className="ml-2 text-sm text-gray-500">Smart Clipboard</span>
          </div>

          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search clipboard history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <Cog6ToothIcon className="h-6 w-6" />
            </button>
            
            <div className="relative">
              <button
                onClick={logout}
                className="flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                <span>{user?.email}</span>
                <span className="ml-2 text-xs text-gray-500">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-gray-600">
              Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Cmd+Shift+V</kbd> to open Epitychia from anywhere
            </p>
          </div>
        </div>
      )}
    </header>
  );
}