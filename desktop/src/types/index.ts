// Re-export shared types for convenience
export * from '../../../shared/types';

// Additional desktop-specific types
export interface WindowState {
  isVisible: boolean;
  isMinimized: boolean;
  isFocused: boolean;
}

export interface TauriEvent<T = any> {
  event: string;
  windowLabel: string;
  payload: T;
  id: number;
}

export interface ClipboardEvent {
  content: string;
  timestamp: number;
  source?: string;
}