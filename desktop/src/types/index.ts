export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  firebaseUid: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  enableNotifications: boolean;
  autoSync: boolean;
  maxHistoryItems: number;
  enableAI: boolean;
}

export interface ClipboardItem {
  id: string;
  userId: string;
  content: string;
  contentType: 'text' | 'image' | 'file' | 'url';
  metadata: ClipboardMetadata;
  entities: DetectedEntity[];
  suggestions: ActionSuggestion[];
  timestamp: string; // For backward compatibility
  createdAt: string;
  updatedAt: string;
  deviceId?: string;
  deletedAt?: string; // For recycle bin functionality
}

export interface ClipboardMetadata {
  sourceApp?: string;
  deviceId?: string;
  category: ContentCategory;
  confidence: number;
  size?: number;
  mimeType?: string;
}

export interface DetectedEntity {
  type: EntityType;
  value: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface ActionSuggestion {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  icon: string;
  confidence: number;
  metadata: Record<string, any>;
}

export type EntityType = 
  | 'email' 
  | 'phone' 
  | 'address' 
  | 'date' 
  | 'time' 
  | 'url' 
  | 'person' 
  | 'organization' 
  | 'location';

export type ContentCategory = 
  | 'contact' 
  | 'event' 
  | 'location' 
  | 'document' 
  | 'media' 
  | 'code' 
  | 'other';

export type ActionType = 
  | 'open_maps' 
  | 'create_event' 
  | 'call_phone' 
  | 'send_email' 
  | 'open_url' 
  | 'add_contact' 
  | 'create_note' 
  | 'search_web';