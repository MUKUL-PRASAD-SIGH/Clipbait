import { useState } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, CogIcon, ArrowRightOnRectangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useClipboardStore } from '../store/clipboardStore';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/Button';
import { UserSettings } from './UserSettings';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { RecycleBin } from './RecycleBin';
import { RecycleBinHover } from './RecycleBinHover';
import toast from 'react-hot-toast';

export function Header() {
  const { searchQuery, setSearchQuery, items, moveAllToRecycleBin, deletedItems } = useClipboardStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showRecycleBinHover, setShowRecycleBinHover] = useState(false);

  const totalItems = items.length;
  const todayItems = items.filter(item => {
    const today = new Date().toDateString();
    return new Date(item.timestamp).toDateString() === today;
  }).length;

  const handleExportData = () => {
    try {
      const exportData = {
        user: {
          email: user?.email,
          displayName: user?.displayName,
          exportDate: new Date().toISOString(),
        },
        clipboardItems: items.map(item => ({
          id: item.id,
          content: item.content,
          timestamp: item.timestamp,
          entities: item.entities,
          suggestions: item.suggestions,
          metadata: item.metadata,
        })),
        statistics: {
          totalItems,
          todayItems,
        },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `epitychia-export-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!', {
        icon: '📥',
        duration: 3000,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between py-4 px-6">
        {/* Left Section - Title and Search */}
        <div className="flex items-center space-x-6 flex-1">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wider uppercase">SMART CLIPBOARD</h1>
          </div>

          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search clipboard history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Section - User Profile */}
        <div className="flex items-center space-x-4 ml-6">
          {/* Stats */}
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <span className="font-medium text-gray-900 dark:text-gray-100">{totalItems}</span>
              <span>items</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-gray-900 dark:text-gray-100">{todayItems}</span>
              <span>today</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {isAuthenticated 
                    ? (user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U')
                    : '👤'
                  }
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isAuthenticated ? (user?.displayName || user?.email?.split('@')[0] || 'User') : 'Guest'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {isAuthenticated ? '🟢 Online' : '🟡 Guest Mode'}
                </div>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-white">
                        {isAuthenticated 
                          ? (user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U')
                          : '👤'
                        }
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {isAuthenticated ? (user?.displayName || user?.email?.split('@')[0] || 'User') : 'Guest User'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {isAuthenticated ? user?.email : 'Using MVP mode'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <CogIcon className="h-4 w-4" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      handleExportData();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export Data</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowRecycleBin(true);
                        setShowUserMenu(false);
                      }}
                      onMouseEnter={() => setShowRecycleBinHover(true)}
                      onMouseLeave={() => setShowRecycleBinHover(false)}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <div className="flex items-center justify-between flex-1">
                        <span>Recycle Bin</span>
                        {deletedItems.length > 0 && (
                          <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs px-2 py-0.5 rounded-full">
                            {deletedItems.length}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Hover Menu */}
                    <div
                      onMouseEnter={() => setShowRecycleBinHover(true)}
                      onMouseLeave={() => setShowRecycleBinHover(false)}
                    >
                      <RecycleBinHover
                        isVisible={showRecycleBinHover}
                        onViewAll={() => {
                          setShowRecycleBin(true);
                          setShowUserMenu(false);
                          setShowRecycleBinHover(false);
                        }}
                      />
                    </div>
                  </div>



                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <UserSettings onClose={() => setShowSettings(false)} />
      )}



      {/* Recycle Bin Modal */}
      <RecycleBin
        isOpen={showRecycleBin}
        onClose={() => setShowRecycleBin(false)}
      />
    </header>
  );
}