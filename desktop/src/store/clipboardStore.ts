import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClipboardItem, ActionSuggestion } from '../types';
import { clipboardApi } from '../services/api';
import toast from 'react-hot-toast';

interface ClipboardState {
  items: ClipboardItem[];
  selectedItem: ClipboardItem | null;
  suggestions: ActionSuggestion[];
  isLoading: boolean;
  searchQuery: string;
  isOffline: boolean;
  pendingSync: ClipboardItem[];
  showLiveNotification: boolean;
  liveNotificationContent: string;
  
  // Actions
  initialize: () => Promise<void>;
  addClipboardItem: (content: string) => Promise<void>;
  selectItem: (item: ClipboardItem) => void;
  deleteItem: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  executeSuggestion: (suggestion: ActionSuggestion) => Promise<void>;
  syncPendingItems: () => Promise<void>;
  setOfflineStatus: (offline: boolean) => void;
  hideLiveNotification: () => void;
  clearHistory: () => void;
}

export const useClipboardStore = create<ClipboardState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItem: null,
      suggestions: [],
      isLoading: false,
      searchQuery: '',
      isOffline: false,
      pendingSync: [],
      showLiveNotification: false,
      liveNotificationContent: '',

  initialize: async () => {
    set({ isLoading: true });
    try {
      // Try to load from API first (for synced history)
      try {
        const items = await clipboardApi.getHistory();
        set({ items, isLoading: false });
        console.log('Loaded clipboard history from API:', items.length, 'items');
      } catch (apiError) {
        console.log('API not available, using local storage only');
        // API not available, just use local storage (which is handled by persist middleware)
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize clipboard:', error);
      // Don't show error toast for initialization - it's expected in offline mode
      set({ isLoading: false });
    }
  },

  addClipboardItem: async (content: string) => {
    const tempId = `temp-${Date.now()}`;
    const tempItem: ClipboardItem = {
      id: tempId,
      content,
      contentType: 'text',
      entities: [],
      suggestions: [],
      metadata: { category: 'other', confidence: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to local state immediately for offline support
    set(state => {
      const updatedItems = [tempItem, ...state.items];
      const limitedItems = updatedItems.slice(0, 5);
      
      return {
        items: limitedItems,
        selectedItem: tempItem,
        suggestions: [],
        showLiveNotification: true,
        liveNotificationContent: content
      };
    });

    try {
      const newItem = await clipboardApi.addItem(content);
      
      // Replace temp item with real item
      set(state => ({
        items: state.items.map(item => 
          item.id === tempId ? newItem : item
        ),
        selectedItem: state.selectedItem?.id === tempId ? newItem : state.selectedItem,
        suggestions: newItem.suggestions || []
      }));
      
      if (newItem.suggestions && newItem.suggestions.length > 0) {
        toast.success(`Found ${newItem.suggestions.length} smart suggestions!`, {
          icon: '🧠',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to add clipboard item:', error);
      
      // Mark as pending sync for offline support
      set(state => ({
        pendingSync: [...state.pendingSync, tempItem],
        isOffline: true
      }));
      
      toast.error('Working offline - will sync when connected', {
        icon: '📡',
        duration: 2000,
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
  },

  // Utility functions
  getTotalItems: () => get().items.length,
  
  getItemsToday: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().items.filter(item => new Date(item.createdAt) >= today).length;
  },

  clearHistory: () => {
    set({ items: [], selectedItem: null, suggestions: [] });
    toast.success('Clipboard history cleared');
  },

  syncPendingItems: async () => {
    const { pendingSync } = get();
    if (pendingSync.length === 0) return;

    try {
      for (const item of pendingSync) {
        await clipboardApi.addItem(item.content);
      }
      
      set({ pendingSync: [], isOffline: false });
      toast.success('Synced offline items');
    } catch (error) {
      console.error('Failed to sync pending items:', error);
    }
  },

  setOfflineStatus: (offline: boolean) => {
    set({ isOffline: offline });
    if (!offline) {
      get().syncPendingItems();
    }
  },

  hideLiveNotification: () => {
    set({ showLiveNotification: false, liveNotificationContent: '' });
  }
    }),
    {
      name: 'clipboard-storage',
      partialize: (state) => ({
        items: state.items,
        pendingSync: state.pendingSync,
      }),
    }
  )
);