import { create } from 'zustand';
import { ClipboardItem, ApiResponse } from '../../../shared/types';
import toast from 'react-hot-toast';

interface ClipboardStore {
  items: ClipboardItem[];
  selectedItem: ClipboardItem | null;
  searchQuery: string;
  suggestions: any[];
  loading: boolean;
  error: string | null;
  isLiveNotificationVisible: boolean;
  liveNotificationContent: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  addClipboardItem: (content: string) => Promise<void>;
  removeClipboardItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  pinItem: (id: string) => Promise<void>;
  unpinItem: (id: string) => Promise<void>;
  showLiveNotification: (content: string) => void;
  hideLiveNotification: () => void;
  refreshItems: () => Promise<void>;
  selectItem: (item: ClipboardItem) => void;
  deleteItem: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  executeSuggestion: (suggestion: any) => Promise<void>;
}

export const useClipboardStore = create<ClipboardStore>((set, get) => ({
  items: [],
  selectedItem: null,
  searchQuery: '',
  suggestions: [],
  loading: false,
  error: null,
  isLiveNotificationVisible: false,
  liveNotificationContent: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      await get().refreshItems();
    } catch (error) {
      console.error('Failed to initialize clipboard store:', error);
      set({ error: 'Failed to initialize clipboard' });
    } finally {
      set({ loading: false });
    }
  },

  addClipboardItem: async (content: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/clipboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Failed to add clipboard item');
      }

      const data: ApiResponse<ClipboardItem> = await response.json();
      if (data.success && data.data) {
        set(state => ({
          items: [data.data!, ...state.items]
        }));
        
        // Show live notification
        get().showLiveNotification(content);
        
        toast.success('Clipboard item added');
      }
    } catch (error) {
      console.error('Error adding clipboard item:', error);
      toast.error('Failed to add clipboard item');
    }
  },

  removeClipboardItem: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/clipboard/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove clipboard item');
      }

      set(state => ({
        items: state.items.filter(item => item.id !== id)
      }));
      
      toast.success('Clipboard item removed');
    } catch (error) {
      console.error('Error removing clipboard item:', error);
      toast.error('Failed to remove clipboard item');
    }
  },

  clearHistory: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/clipboard/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear clipboard history');
      }

      set({ items: [] });
      toast.success('Clipboard history cleared');
    } catch (error) {
      console.error('Error clearing clipboard history:', error);
      toast.error('Failed to clear clipboard history');
    }
  },

  pinItem: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/clipboard/${id}/pin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to pin item');
      }

      set(state => ({
        items: state.items.map(item => 
          item.id === id ? { ...item, isPinned: true } : item
        )
      }));
      
      toast.success('Item pinned');
    } catch (error) {
      console.error('Error pinning item:', error);
      toast.error('Failed to pin item');
    }
  },

  unpinItem: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/clipboard/${id}/unpin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to unpin item');
      }

      set(state => ({
        items: state.items.map(item => 
          item.id === id ? { ...item, isPinned: false } : item
        )
      }));
      
      toast.success('Item unpinned');
    } catch (error) {
      console.error('Error unpinning item:', error);
      toast.error('Failed to unpin item');
    }
  },

  showLiveNotification: (content: string) => {
    set({ 
      isLiveNotificationVisible: true, 
      liveNotificationContent: content 
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      get().hideLiveNotification();
    }, 5000);
  },

  hideLiveNotification: () => {
    set({ 
      isLiveNotificationVisible: false, 
      liveNotificationContent: null 
    });
  },

  refreshItems: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/clipboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clipboard items');
      }

      const data: ApiResponse<ClipboardItem[]> = await response.json();
      if (data.success && data.data) {
        set({ items: data.data });
      }
    } catch (error) {
      console.error('Error refreshing clipboard items:', error);
      set({ error: 'Failed to refresh clipboard items' });
    }
  },

  selectItem: (item: ClipboardItem) => {
    set({ 
      selectedItem: item,
      suggestions: item.suggestions || []
    });
  },

  deleteItem: async (id: string) => {
    await get().removeClipboardItem(id);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  executeSuggestion: async (suggestion: any) => {
    try {
      // TODO: Implement suggestion execution logic
      console.log('Executing suggestion:', suggestion);
      toast.success('Suggestion executed');
    } catch (error) {
      console.error('Error executing suggestion:', error);
      toast.error('Failed to execute suggestion');
    }
  }
}));