export interface ClipboardItem {
  id: string;
  content: string;
  contentType: 'text' | 'image' | 'file' | 'url';
  entities: DetectedEntity[];
  suggestions: ActionSuggestion[];
  metadata: ClipboardMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface ClipboardMetadata {
  category: ContentCategory;
  confidence: number;
  sourceApp?: string;
  deviceId?: string;
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