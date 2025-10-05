import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClipboardItem, ActionSuggestion } from '../types';
import { clipboardApi } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ClipboardContextType {
  items: ClipboardItem[];
  selectedItem: ClipboardItem | null;
  suggestions: ActionSuggestion[];
  isLoading: boolean;
  isOffline: boolean;
  addItem: (content: string) => Promise<void>;
  selectItem: (item: ClipboardItem) => void;
  deleteItem: (id: string) => Promise<void>;
  executeSuggestion: (suggestion: ActionSuggestion) => Promise<void>;
  refreshItems: () => Promise<void>;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
};

interface ClipboardProviderProps {
  children: ReactNode;
}

export const ClipboardProvider: React.FC<ClipboardProviderProps> = ({ children }) => {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ClipboardItem | null>(null);
  const [suggestions, setSuggestions] = useState<ActionSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Load items from local storage on startup
  useEffect(() => {
    loadLocalItems();
    refreshItems();
  }, []);

  const loadLocalItems = async () => {
    try {
      const localItems = await AsyncStorage.getItem('clipboard_items');
      if (localItems) {
        setItems(JSON.parse(localItems));
      }
    } catch (error) {
      console.error('Failed to load local items:', error);
    }
  };

  const saveLocalItems = async (newItems: ClipboardItem[]) => {
    try {
      await AsyncStorage.setItem('clipboard_items', JSON.stringify(newItems));
    } catch (error) {
      console.error('Failed to save local items:', error);
    }
  };

  const refreshItems = async () => {
    setIsLoading(true);
    try {
      const fetchedItems = await clipboardApi.getHistory();
      setItems(fetchedItems);
      await saveLocalItems(fetchedItems);
      setIsOffline(false);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setIsOffline(true);
      // Use local items when offline
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (content: string) => {
    const tempItem: ClipboardItem = {
      id: `temp-${Date.now()}`,
      content,
      contentType: 'text',
      entities: [],
      suggestions: [],
      metadata: { category: 'other', confidence: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add locally first
    const newItems = [tempItem, ...items].slice(0, 50); // Keep last 50 items
    setItems(newItems);
    await saveLocalItems(newItems);

    try {
      const newItem = await clipboardApi.addItem(content);
      // Replace temp item with real item
      const updatedItems = newItems.map(item => 
        item.id === tempItem.id ? newItem : item
      );
      setItems(updatedItems);
      await saveLocalItems(updatedItems);
      setIsOffline(false);
    } catch (error) {
      console.error('Failed to add item to server:', error);
      setIsOffline(true);
    }
  };

  const selectItem = (item: ClipboardItem) => {
    setSelectedItem(item);
    setSuggestions(item.suggestions || []);
  };

  const deleteItem = async (id: string) => {
    try {
      await clipboardApi.deleteItem(id);
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      await saveLocalItems(updatedItems);
      
      if (selectedItem?.id === id) {
        setSelectedItem(null);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      setIsOffline(true);
    }
  };

  const executeSuggestion = async (suggestion: ActionSuggestion) => {
    try {
      await clipboardApi.executeSuggestion(suggestion.id);
    } catch (error) {
      console.error('Failed to execute suggestion:', error);
    }
  };

  const value: ClipboardContextType = {
    items,
    selectedItem,
    suggestions,
    isLoading,
    isOffline,
    addItem,
    selectItem,
    deleteItem,
    executeSuggestion,
    refreshItems,
  };

  return (
    <ClipboardContext.Provider value={value}>
      {children}
    </ClipboardContext.Provider>
  );
};