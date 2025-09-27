import React from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Button } from './Button';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  const handleThemeChange = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '💻'; // system
  };

  const getLabel = () => {
    if (theme === 'light') return 'Light';
    if (theme === 'dark') return 'Dark';
    return 'System';
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleThemeChange}
      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      title={`Current theme: ${getLabel()}. Click to cycle through themes.`}
    >
      <span className="mr-1">{getIcon()}</span>
      <span className="hidden sm:inline">{getLabel()}</span>
    </Button>
  );
};