import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface UserSettingsProps {
  onClose: () => void;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoSync: boolean;
  clipboardHistory: {
    maxItems: number;
    retentionDays: number;
    autoCleanup: boolean;
  };
  ai: {
    enabled: boolean;
    autoProcess: boolean;
    confidenceThreshold: number;
  };
  privacy: {
    encryptSensitiveData: boolean;
    excludePasswords: boolean;
    excludeCredentials: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  notifications: true,
  autoSync: true,
  clipboardHistory: {
    maxItems: 1000,
    retentionDays: 30,
    autoCleanup: true,
  },
  ai: {
    enabled: true,
    autoProcess: true,
    confidenceThreshold: 0.7,
  },
  privacy: {
    encryptSensitiveData: true,
    excludePasswords: true,
    excludeCredentials: true,
  },
};

export const UserSettings: React.FC<UserSettingsProps> = ({ onClose }) => {
  const { user, logout } = useAuthStore();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'privacy' | 'about'>('profile');

  useEffect(() => {
    // Load user preferences from localStorage or API
    const savedPreferences = localStorage.getItem('user_preferences');
    if (savedPreferences) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(savedPreferences) });
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }, []);

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (in a real app, this would be saved to the backend)
      localStorage.setItem('user_preferences', JSON.stringify(preferences));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const updatePreference = (path: string, value: any) => {
    setPreferences(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
        <CardHeader bordered>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                ⚙️ User Settings
              </CardTitle>
              <CardDescription>
                Manage your account and application preferences
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <div className="p-4 space-y-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <CardContent className="p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                    
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl text-white">
                          {user?.email?.charAt(0).toUpperCase() || '👤'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{user?.email || 'Guest User'}</h4>
                        <p className="text-sm text-gray-600">Member since {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <Input
                          value={user?.email || ''}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Name
                        </label>
                        <Input
                          placeholder="Enter display name"
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        🔑 Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        📧 Update Email
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start"
                        onClick={handleLogout}
                      >
                        🚪 Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Application Preferences</h3>
                    
                    {/* Theme Settings */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Appearance</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Theme
                          </label>
                          <div className="flex space-x-2">
                            {(['light', 'dark', 'system'] as const).map((theme) => (
                              <Button
                                key={theme}
                                variant={preferences.theme === theme ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updatePreference('theme', theme)}
                              >
                                {theme === 'light' && '☀️'} 
                                {theme === 'dark' && '🌙'} 
                                {theme === 'system' && '💻'} 
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Clipboard Settings */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Clipboard History</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Items
                          </label>
                          <Input
                            type="number"
                            value={preferences.clipboardHistory.maxItems}
                            onChange={(e) => updatePreference('clipboardHistory.maxItems', parseInt(e.target.value))}
                            min="100"
                            max="10000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Retention (Days)
                          </label>
                          <Input
                            type="number"
                            value={preferences.clipboardHistory.retentionDays}
                            onChange={(e) => updatePreference('clipboardHistory.retentionDays', parseInt(e.target.value))}
                            min="1"
                            max="365"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.clipboardHistory.autoCleanup}
                            onChange={(e) => updatePreference('clipboardHistory.autoCleanup', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Auto-cleanup old items</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.autoSync}
                            onChange={(e) => updatePreference('autoSync', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Auto-sync across devices</span>
                        </label>
                      </div>
                    </div>

                    {/* AI Settings */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">AI Processing</h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.ai.enabled}
                            onChange={(e) => updatePreference('ai.enabled', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Enable AI processing</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.ai.autoProcess}
                            onChange={(e) => updatePreference('ai.autoProcess', e.target.checked)}
                            className="mr-2"
                            disabled={!preferences.ai.enabled}
                          />
                          <span className="text-sm text-gray-700">Auto-process clipboard content</span>
                        </label>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confidence Threshold: {Math.round(preferences.ai.confidenceThreshold * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={preferences.ai.confidenceThreshold}
                            onChange={(e) => updatePreference('ai.confidenceThreshold', parseFloat(e.target.value))}
                            className="w-full"
                            disabled={!preferences.ai.enabled}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Privacy & Security</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                          <span className="text-yellow-600 mr-2">⚠️</span>
                          <div>
                            <h4 className="font-medium text-yellow-800">Privacy Notice</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              Your clipboard data is processed locally and encrypted before storage. 
                              Sensitive information is automatically detected and handled with extra care.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.privacy.encryptSensitiveData}
                            onChange={(e) => updatePreference('privacy.encryptSensitiveData', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Encrypt sensitive data</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.privacy.excludePasswords}
                            onChange={(e) => updatePreference('privacy.excludePasswords', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Exclude passwords from history</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.privacy.excludeCredentials}
                            onChange={(e) => updatePreference('privacy.excludeCredentials', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Exclude credit card numbers</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.notifications}
                            onChange={(e) => updatePreference('notifications', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Enable notifications</span>
                        </label>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-3">Data Management</h4>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            📥 Export Data
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            🗑️ Clear All Data
                          </Button>
                          <Button variant="destructive" className="w-full justify-start">
                            ❌ Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-white">📋</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gradient mb-2">Epitychia</h3>
                    <p className="text-gray-600 mb-4">Smart Clipboard Management</p>
                    <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Version 1.0.0 Beta
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card variant="outlined">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">🚀 Features</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• AI-powered content analysis</li>
                          <li>• Cross-platform synchronization</li>
                          <li>• Smart action suggestions</li>
                          <li>• Privacy-focused design</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card variant="outlined">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">📞 Support</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Need help? Contact us:</p>
                          <p>📧 support@epitychia.com</p>
                          <p>🌐 docs.epitychia.com</p>
                          <p>💬 Join our Discord</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    <p>© 2024 Epitychia. All rights reserved.</p>
                    <div className="mt-2 space-x-4">
                      <button className="hover:text-gray-700">Privacy Policy</button>
                      <button className="hover:text-gray-700">Terms of Service</button>
                      <button className="hover:text-gray-700">Open Source</button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Changes are saved automatically
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={savePreferences}
              loading={isSaving}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};