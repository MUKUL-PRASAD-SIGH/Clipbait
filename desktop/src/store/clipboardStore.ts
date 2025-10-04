import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ClipboardItem,
  ActionSuggestion,
  ApiResponse,
} from "../../../shared/types";
import toast from "react-hot-toast";
import { clipboardApi } from "../services/api";

interface ClipboardStore {
  items: ClipboardItem[];
  selectedItem: ClipboardItem | null;
  suggestions: ActionSuggestion[];
  deletedItems: ClipboardItem[];
  isLoading: boolean;
  searchQuery: string;
  isOffline: boolean;
  pendingSync: ClipboardItem[];
  showLiveNotification: boolean;
  liveNotificationContent: string;

  // Actions
  initialize: () => Promise<void>;
  addClipboardItem: (content: string) => Promise<void>;
  removeClipboardItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  pinItem: (id: string) => Promise<void>;
  unpinItem: (id: string) => Promise<void>;
  refreshItems: () => Promise<void>;
  selectItem: (item: ClipboardItem) => void;
  deleteItem: (id: string) => Promise<void>;
  restoreItem: (id: string) => void;
  permanentlyDeleteItem: (id: string) => void;
  emptyRecycleBin: () => void;
  moveAllToRecycleBin: () => void;
  setSearchQuery: (query: string) => void;
  executeSuggestion: (suggestion: ActionSuggestion) => Promise<void>;
  hideLiveNotification: () => void;
  getTotalItems: () => number;
  getItemsToday: () => number;
  syncPendingItems: () => Promise<void>;
  setOfflineStatus: (offline: boolean) => void;
}

export const useClipboardStore = create<ClipboardStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItem: null,
      suggestions: [],
      deletedItems: [],
      isLoading: false,
      searchQuery: "",
      isOffline: false,
      pendingSync: [],
      showLiveNotification: false,
      liveNotificationContent: "",

      initialize: async () => {
        set({ isLoading: true });
        try {
          // Try to load from API first (for synced history)
          try {
            const items = await clipboardApi.getHistory();
            // Ensure items is always an array
            const safeItems = Array.isArray(items) ? items : [];
            set({ items: safeItems, isLoading: false });
            console.log(
              "Loaded clipboard history from API:",
              safeItems.length,
              "items"
            );
          } catch (apiError) {
            console.log("API not available, using local storage and sample data");
            // API not available, use local storage or create sample data for demo
            set((state) => {
              let currentItems = Array.isArray(state.items) ? state.items : [];
              
              // If no items exist, add some sample data for demo
              if (currentItems.length === 0) {
                currentItems = [
                  {
                    id: 'sample-1',
                    userId: 'demo-user',
                    content: 'Welcome to Epitychia! This is a sample clipboard item with AI-powered transformations.',
                    contentType: 'text' as const,
                    entities: [
                      { type: 'other', value: 'Epitychia', confidence: 0.9, startIndex: 11, endIndex: 20 }
                    ],
                    suggestions: [
                      { id: 'summarize', type: 'summarize_bullets', title: 'Summarize', description: 'Create bullet points', icon: '📝', confidence: 0.9, metadata: {} },
                      { id: 'professional', type: 'professional_tone', title: 'Make Professional', description: 'Convert to business tone', icon: '💼', confidence: 0.8, metadata: {} }
                    ],
                    metadata: { category: 'other', confidence: 0.8 },
                    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
                    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
                  },
                  {
                    id: 'sample-2',
                    userId: 'demo-user',
                    content: 'hey can you help me with this project? i need to get it done asap and its really important for the meeting tomorrow',
                    contentType: 'text' as const,
                    entities: [],
                    suggestions: [
                      { id: 'professional', type: 'professional_tone', title: 'Make Professional', description: 'Convert to business tone', icon: '💼', confidence: 0.9, metadata: {} },
                      { id: 'grammar', type: 'fix_grammar', title: 'Fix Grammar', description: 'Correct grammar and capitalization', icon: '✏️', confidence: 0.8, metadata: {} }
                    ],
                    metadata: { category: 'other', confidence: 0.7 },
                    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
                    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
                  }
                ];
              }
              
              return { 
                items: currentItems,
                isLoading: false 
              };
            });
          }
        } catch (error) {
          console.error("Failed to initialize clipboard:", error);
          // Don't show error toast for initialization - it's expected in offline mode
          set((state) => ({ 
            items: Array.isArray(state.items) ? state.items : [],
            isLoading: false 
          }));
        }
      },

      addClipboardItem: async (content: string) => {
        const tempId = `temp-${Date.now()}`;
        const tempItem: ClipboardItem = {
          id: tempId,
          userId: "temp-user",
          content,
          contentType: "text",
          entities: [],
          suggestions: [],
          metadata: { category: "other", confidence: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to local state immediately for offline support
        set((state) => {
          const updatedItems = [tempItem, ...state.items];
          const limitedItems = updatedItems.slice(0, 5);

          return {
            items: limitedItems,
            selectedItem: tempItem,
            suggestions: [],
            showLiveNotification: false, // Disabled to avoid popup interruptions
            liveNotificationContent: "",
          };
        });

        try {
          const newItem = await clipboardApi.addItem(content);

          // Replace temp item with real item
          set((state) => ({
            items: state.items.map((item) =>
              item.id === tempId ? newItem : item
            ),
            selectedItem:
              state.selectedItem?.id === tempId ? newItem : state.selectedItem,
            suggestions: newItem.suggestions || [],
          }));

          if (newItem.suggestions && newItem.suggestions.length > 0) {
            toast.success(
              `Found ${newItem.suggestions.length} smart suggestions!`,
              {
                icon: "🧠",
                duration: 3000,
              }
            );
          }
        } catch (error) {
          console.error("Failed to add clipboard item:", error);

          // Mark as pending sync for offline support
          set((state) => ({
            pendingSync: [...state.pendingSync, tempItem],
            isOffline: true,
          }));

          toast.error("Working offline - will sync when connected", {
            icon: "📡",
            duration: 2000,
          });
        }
      },

      removeClipboardItem: async (id: string) => {
        try {
          await clipboardApi.deleteItem(id);
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
          toast.success("Clipboard item removed");
        } catch (error) {
          console.error("Error removing clipboard item:", error);
          toast.error("Failed to remove clipboard item");
        }
      },

      clearHistory: async () => {
        set({
          items: [],
          selectedItem: null,
          suggestions: [],
          deletedItems: [],
        });
        toast.success("Clipboard history and recycle bin cleared");
      },

      pinItem: async (id: string) => {
        try {
          await clipboardApi.pinItem(id);
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, isPinned: true } : item
            ),
          }));
          toast.success("Item pinned");
        } catch (error) {
          console.error("Error pinning item:", error);
          toast.error("Failed to pin item");
        }
      },

      unpinItem: async (id: string) => {
        try {
          await clipboardApi.unpinItem(id);
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, isPinned: false } : item
            ),
          }));
          toast.success("Item unpinned");
        } catch (error) {
          console.error("Error unpinning item:", error);
          toast.error("Failed to unpin item");
        }
      },

      refreshItems: async () => {
        try {
          const items = await clipboardApi.getHistory();
          set({ items });
        } catch (error) {
          console.error("Error refreshing clipboard items:", error);
        }
      },

      selectItem: (item: ClipboardItem) => {
        set({
          selectedItem: item,
          suggestions: item.suggestions || [],
        });
      },

      deleteItem: async (id: string) => {
        console.log("deleteItem called with id:", id);

        // Move item to recycle bin instead of permanent deletion
        set((state) => {
          const itemToDelete = state.items.find((item) => item.id === id);
          if (!itemToDelete) return state;

          return {
            ...state,
            items: state.items.filter((item) => item.id !== id),
            deletedItems: [
              ...state.deletedItems,
              { ...itemToDelete, deletedAt: new Date().toISOString() },
            ],
            selectedItem:
              state.selectedItem?.id === id ? null : state.selectedItem,
            suggestions: state.selectedItem?.id === id ? [] : state.suggestions,
          };
        });

        toast.success("Item moved to recycle bin");

        // Try to delete from API in background (optional)
        try {
          await clipboardApi.deleteItem(id);
        } catch (error) {
          console.log(
            "API deletion failed, but item moved to recycle bin locally"
          );
        }
      },

      restoreItem: (id: string) => {
        set((state) => {
          const itemToRestore = state.deletedItems.find(
            (item) => item.id === id
          );
          if (!itemToRestore) return state;

          // Remove deletedAt property when restoring
          const { deletedAt, ...restoredItem } = itemToRestore;
          const cleanItem: ClipboardItem = restoredItem as ClipboardItem;

          return {
            ...state,
            deletedItems: state.deletedItems.filter((item) => item.id !== id),
            items: [cleanItem, ...state.items],
          };
        });

        toast.success("Item restored from recycle bin");
      },

      permanentlyDeleteItem: (id: string) => {
        set((state) => ({
          ...state,
          deletedItems: state.deletedItems.filter((item) => item.id !== id),
        }));

        toast.success("Item permanently deleted");
      },

      emptyRecycleBin: () => {
        set((state) => ({
          ...state,
          deletedItems: [],
        }));

        toast.success("Recycle bin emptied");
      },

      moveAllToRecycleBin: () => {
        set((state) => {
          const itemsWithDeletedAt = state.items.map((item) => ({
            ...item,
            deletedAt: new Date().toISOString(),
          }));

          return {
            ...state,
            items: [],
            deletedItems: [...state.deletedItems, ...itemsWithDeletedAt],
            selectedItem: null,
            suggestions: [],
          };
        });

        toast.success("All items moved to recycle bin");
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      executeSuggestion: async (suggestion: ActionSuggestion) => {
        try {
          await clipboardApi.executeSuggestion(suggestion.id);
          toast.success(`Executed: ${suggestion.title}`);
        } catch (error) {
          console.error("Failed to execute suggestion:", error);
          toast.error("Failed to execute action");
        }
      },

      // Utility functions
      getTotalItems: () => get().items.length,

      getItemsToday: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().items.filter((item) => new Date(item.createdAt) >= today)
          .length;
      },

      syncPendingItems: async () => {
        const { pendingSync } = get();
        if (pendingSync.length === 0) return;

        try {
          for (const item of pendingSync) {
            await clipboardApi.addItem(item.content);
          }

          set({ pendingSync: [], isOffline: false });
          toast.success("Synced offline items");
        } catch (error) {
          console.error("Failed to sync pending items:", error);
        }
      },

      setOfflineStatus: (offline: boolean) => {
        set({ isOffline: offline });
        if (!offline) {
          get().syncPendingItems();
        }
      },

      hideLiveNotification: () => {
        set({ showLiveNotification: false, liveNotificationContent: "" });
      },
    }),
    {
      name: "clipboard-storage",
      partialize: (state) => ({
        items: state.items,
        deletedItems: state.deletedItems,
        pendingSync: state.pendingSync,
      }),
    }
  )
);
