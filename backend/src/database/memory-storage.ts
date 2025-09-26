// Temporary in-memory storage for MVP demo
export class MemoryStorage {
  private clipboardItems: any[] = [];
  private users: any[] = [];

  // Simulate database operations
  async query(sql: string, params?: any[]): Promise<{ rows: any[] }> {
    console.log('Memory DB Query:', sql, params);
    
    // Mock successful responses for common queries
    if (sql.includes('SELECT NOW()')) {
      return { rows: [{ now: new Date(), version: 'Memory DB v1.0' }] };
    }
    
    if (sql.includes('CREATE TABLE')) {
      return { rows: [] };
    }
    
    if (sql.includes('CREATE INDEX')) {
      return { rows: [] };
    }
    
    if (sql.includes('INSERT INTO clipboard_items')) {
      const item = {
        id: Math.random().toString(36),
        user_id: params?.[0] || 'demo-user',
        content: params?.[1] || 'demo content',
        content_type: params?.[2] || 'text',
        created_at: new Date()
      };
      this.clipboardItems.push(item);
      return { rows: [item] };
    }
    
    if (sql.includes('SELECT') && sql.includes('clipboard_items')) {
      return { rows: this.clipboardItems };
    }
    
    return { rows: [] };
  }

  async connect() {
    return {
      query: this.query.bind(this),
      release: () => {}
    };
  }
}

export const memoryStorage = new MemoryStorage();