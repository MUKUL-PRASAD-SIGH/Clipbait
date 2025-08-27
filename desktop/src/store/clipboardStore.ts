import { create } from 'zustand';
import { ClipboardItem, ActionSuggestion } from '../types';
import { clipboardApi } from '../services/api';
import toast from 'react-hot-toast';

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
      toast.error('Failed to load clipboard history');
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
        toast.success(`Found ${newItem.suggestions.length} suggestions for your clipboard!`);
      }
    } catch (error) {
      console.error('Failed to add clipboard item:', error);
      toast.error('Failed to process clipboard content');
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
      toast.success('Item deleted');
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  executeSuggestion: async (suggestion: ActionSuggestion) => {
    try {
      await clipboardApi.executeSuggestion(suggestion.id);
      toast.success(`Executed: ${suggestion.title}`);
    } catch (error) {
      console.error('Failed to execute suggestion:', error);
      toast.error('Failed to execute action');
    }
  }
}));