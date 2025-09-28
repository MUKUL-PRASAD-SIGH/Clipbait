import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, CommandLineIcon, FolderIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface SearchResult {
  type: 'item' | 'collection' | 'command';
  id: string;
  title: string;
  description: string;
  content?: string;
  score: number;
  metadata?: Record<string, any>;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (result: SearchResult) => void;
}

export function CommandPalette({ isOpen, onClose, onExecute }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      loadSuggestions();
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      searchAll(query);
    } else {
      setResults(suggestions);
    }
  }, [query, suggestions]);

  const loadSuggestions = async () => {
    try {
      const response = await fetch('/api/command-palette/suggestions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data.suggestions || []);
        setResults(data.data.suggestions || []);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const searchAll = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/command-palette/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.data.results || []);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleExecute(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleExecute = async (result: SearchResult) => {
    if (result.type === 'command') {
      try {
        const response = await fetch('/api/command-palette/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            commandId: result.metadata?.action || result.id,
            params: result.metadata
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Command executed:', data);
        }
      } catch (error) {
        console.error('Error executing command:', error);
      }
    }
    
    onExecute(result);
    onClose();
  };

  const getResultIcon = (result: SearchResult) => {
    switch (result.type) {
      case 'command':
        return result.metadata?.icon || '⚡';
      case 'collection':
        return '📁';
      case 'item':
        return result.metadata?.contentType === 'url' ? '🔗' : '📄';
      default:
        return '📄';
    }
  };

  const getResultTypeLabel = (result: SearchResult) => {
    switch (result.type) {
      case 'command':
        return 'Command';
      case 'collection':
        return 'Collection';
      case 'item':
        return 'Clipboard Item';
      default:
        return 'Item';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-96 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Command Palette</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search clipboard, collections, and commands..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {query ? (
                <>
                  <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No results found for "{query}"</p>
                </>
              ) : (
                <>
                  <CommandLineIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Start typing to search...</p>
                </>
              )}
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`px-4 py-3 cursor-pointer flex items-center space-x-3 hover:bg-gray-50 ${
                    index === selectedIndex ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                  onClick={() => handleExecute(result)}
                >
                  <div className="text-2xl">{getResultIcon(result)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {result.title}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {getResultTypeLabel(result)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {result.description}
                    </p>
                    {result.content && (
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {result.content.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  {result.metadata?.shortcut && (
                    <div className="text-xs text-gray-400 font-mono">
                      {result.metadata.shortcut}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}