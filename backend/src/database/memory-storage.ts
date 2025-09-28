import { v4 as uuidv4 } from 'uuid';

// Enhanced in-memory storage for demo mode
export class MemoryStorage {
  private clipboardItems: any[] = [];
  private users: any[] = [];
  private collections: any[] = [];
  private collectionItems: any[] = [];

  // Simulate database operations
  async query(sql: string, params?: any[]): Promise<{ rows: any[] }> {
    console.log('Memory DB Query:', sql.substring(0, 100) + '...', params?.length ? `[${params.length} params]` : '');
    
    // Handle system queries
    if (sql.includes('SELECT NOW()')) {
      return { rows: [{ now: new Date(), version: 'PostgreSQL 15.14 (Memory Mode)' }] };
    }
    
    if (sql.includes('CREATE EXTENSION') || sql.includes('CREATE TABLE') || sql.includes('CREATE INDEX') || 
        sql.includes('ALTER TABLE') || sql.includes('DROP TRIGGER') || sql.includes('CREATE TRIGGER') ||
        sql.includes('CREATE OR REPLACE FUNCTION') || sql.includes('DO $$')) {
      return { rows: [] };
    }

    // Handle user operations
    if (sql.includes('INSERT INTO users')) {
      const user = {
        id: params?.[0] || uuidv4(),
        email: params?.[1] || 'demo@example.com',
        password_hash: params?.[2] || 'hashed',
        firebase_uid: params?.[3] || 'demo-uid',
        preferences: typeof params?.[4] === 'string' ? JSON.parse(params[4]) : params?.[4] || {},
        created_at: new Date(),
        updated_at: new Date()
      };
      this.users.push(user);
      return { rows: [user] };
    }

    if (sql.includes('SELECT') && sql.includes('users') && sql.includes('email')) {
      const email = params?.[0];
      const user = this.users.find(u => u.email === email);
      return { rows: user ? [user] : [] };
    }

    if (sql.includes('SELECT') && sql.includes('users') && sql.includes('id')) {
      const id = params?.[0];
      const user = this.users.find(u => u.id === id);
      return { rows: user ? [user] : [] };
    }

    // Handle clipboard operations
    if (sql.includes('INSERT INTO clipboard_items')) {
      const item = {
        id: uuidv4(),
        user_id: params?.[0] || 'demo-user',
        content: params?.[1] || 'demo content',
        content_type: params?.[2] || 'text',
        metadata: typeof params?.[3] === 'string' ? JSON.parse(params[3]) : params?.[3] || {},
        entities: typeof params?.[4] === 'string' ? JSON.parse(params[4]) : params?.[4] || [],
        suggestions: typeof params?.[5] === 'string' ? JSON.parse(params[5]) : params?.[5] || [],
        device_id: params?.[6] || null,
        is_pinned: false,
        collection_id: null,
        staging_group: null,
        transformations: [],
        created_at: new Date(),
        updated_at: new Date()
      };
      this.clipboardItems.unshift(item); // Add to beginning for latest first
      
      // Keep only last 50 items per user
      const userItems = this.clipboardItems.filter(i => i.user_id === item.user_id);
      if (userItems.length > 50) {
        this.clipboardItems = this.clipboardItems.filter(i => 
          i.user_id !== item.user_id || userItems.slice(0, 50).includes(i)
        );
      }
      
      return { rows: [item] };
    }

    if (sql.includes('SELECT') && sql.includes('clipboard_items')) {
      let items = [...this.clipboardItems];
      
      if (params && params.length > 0) {
        // Filter by user_id if provided
        const userId = params[0];
        items = items.filter(item => item.user_id === userId);
      }
      
      // Sort by created_at DESC
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return { rows: items };
    }

    if (sql.includes('UPDATE clipboard_items') && sql.includes('is_pinned')) {
      const itemId = params?.[0];
      const userId = params?.[1];
      const item = this.clipboardItems.find(i => i.id === itemId && i.user_id === userId);
      if (item) {
        item.is_pinned = sql.includes('is_pinned = true');
        item.updated_at = new Date();
        return { rows: [item] };
      }
      return { rows: [] };
    }

    if (sql.includes('DELETE FROM clipboard_items')) {
      if (sql.includes('WHERE id =')) {
        const itemId = params?.[0];
        const userId = params?.[1];
        const index = this.clipboardItems.findIndex(i => i.id === itemId && i.user_id === userId);
        if (index !== -1) {
          this.clipboardItems.splice(index, 1);
          return { rows: [{ id: itemId }] };
        }
      } else if (sql.includes('WHERE user_id =')) {
        const userId = params?.[0];
        this.clipboardItems = this.clipboardItems.filter(i => i.user_id !== userId);
        return { rows: [] };
      }
      return { rows: [] };
    }

    // Handle collection operations
    if (sql.includes('INSERT INTO clipboard_collections')) {
      const collection = {
        id: params?.[0] || uuidv4(),
        user_id: params?.[1] || 'demo-user',
        name: params?.[2] || 'Demo Collection',
        description: params?.[3] || null,
        auto_generated: params?.[4] || false,
        tags: [],
        created_at: new Date(),
        updated_at: new Date()
      };
      this.collections.push(collection);
      return { rows: [collection] };
    }

    if (sql.includes('SELECT') && sql.includes('clipboard_collections')) {
      const userId = params?.[0];
      const userCollections = this.collections.filter(c => c.user_id === userId);
      return { rows: userCollections };
    }

    // Default empty response for unhandled queries
    return { rows: [] };
  }

  async connect() {
    return {
      query: this.query.bind(this),
      release: () => {}
    };
  }

  // Add some demo data
  initializeDemoData() {
    // Add a demo user
    this.users.push({
      id: 'demo-user-id',
      email: 'demo@example.com',
      password_hash: '$2b$12$demo.hash.for.testing.purposes.only',
      firebase_uid: 'demo-firebase-uid',
      preferences: {
        enableNotifications: true,
        autoSync: true,
        maxHistoryItems: 100,
        enableAI: true
      },
      created_at: new Date(),
      updated_at: new Date()
    });

    // Add some demo clipboard items
    const demoItems = [
      'Contact John Doe at john.doe@example.com or call (555) 123-4567',
      'Meeting tomorrow at 2 PM in conference room A',
      'https://github.com/example/project - Check out this repository',
      'TODO: Review the quarterly reports and send feedback',
      'The quick brown fox jumps over the lazy dog'
    ];

    demoItems.forEach((content, index) => {
      this.clipboardItems.push({
        id: `demo-item-${index}`,
        user_id: 'demo-user-id',
        content,
        content_type: 'text',
        metadata: {},
        entities: [],
        suggestions: [],
        device_id: 'demo-device',
        is_pinned: index === 0, // Pin the first item
        collection_id: null,
        staging_group: null,
        transformations: [],
        created_at: new Date(Date.now() - (index * 60000)), // Spread over time
        updated_at: new Date(Date.now() - (index * 60000))
      });
    });

    console.log('✅ Demo data initialized with', this.users.length, 'users and', this.clipboardItems.length, 'clipboard items');
  }
}

export const memoryStorage = new MemoryStorage();