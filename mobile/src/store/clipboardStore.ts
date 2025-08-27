import { create } from 'zustand';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { ClipboardItem, ActionSuggestion } from '../types';
import { clipboardApi } from '../services/api';

interface ClipboardState {
  items: ClipboardItem[];
  selectedItem: ClipboardItem | null;
  suggestions: ActionSuggestion[];
  isLoading: boolean;
  searchQuery: string;
  
  // Actions
  initialize: () => Promise<void>;
  addClipboardItem: (content: string) => Promise<void>;
  selectItem: (item: ClipboardItem) => void;
  deleteItem: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  executeSuggestion: (suggestion: ActionSuggestion) => Promise<void>;
  copyToClipboard: (content: string) => Promise<void>;
}

export const useClipboardStore = create<ClipboardState>((set, get) => ({
  items: [],
  selectedItem: null,
  suggestions: [],
  isLoading: false,
  searchQuery: '',

  initialize: async () => {
    set({ isLoading: true });
    try {
      const items = await clipboardApi.getHistory();
      set({ items, isLoading: false });
    } catch (error) {
      console.error('Failed to initialize clipboard:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load clipboard history',
      });
      set({ isLoading: false });
    }
  },

  addClipboardItem: async (content: string) => {
    try {
      const newItem = await clipboardApi.addItem(content);
      set(state => ({
        items: [newItem, ...state.items],
        selectedItem: newItem,
        suggestions: newItem.suggestions || []
      }));
      
      if (newItem.suggestions && newItem.suggestions.length > 0) {
        Toast.show({
          type: 'success',
          text1: 'Smart suggestions available!',
          text2: `Found ${newItem.suggestions.length} actions for your clipboard`,
        });
      }
    } catch (error) {
      console.error('Failed to add clipboard item:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to process clipboard content',
      });
    }
  },

  selectItem: (item: ClipboardItem) => {
    set({
      selectedItem: item,
      suggestions: item.suggestions || []
    });
  },

  deleteItem: async (id: string) => {
    try {
      await clipboardApi.deleteItem(id);
      set(state => ({
        items: state.items.filter(item => item.id !== id),
        selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
        suggestions: state.selectedItem?.id === id ? [] : state.suggestions
      }));
      Toast.show({
        type: 'success',
        text1: 'Item deleted',
      });
    } catch (error) {
      console.error('Failed to delete item:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to delete item',
      });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  executeSuggestion: async (suggestion: ActionSuggestion) => {
    try {
      await clipboardApi.executeSuggestion(suggestion.id);
      Toast.show({
        type: 'success',
        text1: 'Action executed',
        text2: suggestion.title,
      });
    } catch (error) {
      console.error('Failed to execute suggestion:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to execute action',
      });
    }
  },

  copyToClipboard: async (content: string) => {
    try {
      Clipboard.setString(content);
      Toast.show({
        type: 'success',
        text1: 'Copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to copy',
      });
    }
  }
}));