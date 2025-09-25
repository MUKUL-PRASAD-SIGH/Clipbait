import { ClipboardItem, ActionSuggestion } from '../types';
import { getPool } from '../database/connection';
import { logger } from '../utils/logger';

interface Command {
  id: string;
  title: string;
  description: string;
  category: 'clipboard' | 'collections' | 'actions' | 'search' | 'settings';
  icon: string;
  shortcut?: string;
  action: string;
  metadata?: Record<string, any>;
}

interface SearchResult {
  type: 'item' | 'collection' | 'command';
  id: string;
  title: string;
  description: string;
  content?: string;
  score: number;
  metadata?: Record<string, any>;
}

class CommandPaletteService {
  private commands: Command[] = [
    {
      id: 'search_history',
      title: 'Search Clipboard History',
      description: 'Find items in your clipboard history',
      category: 'search',
      icon: '🔍',
      shortcut: 'Ctrl+H',
      action: 'search_history'
    },
    {
      id: 'create_collection',
      title: 'Create New Collection',
      description: 'Group related clipboard items',
      category: 'collections',
      icon: '📁',
      shortcut: 'Ctrl+N',
      action: 'create_collection'
    },
    {
      id: 'smart_paste',
      title: 'Smart Paste',
      description: 'Paste with intelligent formatting',
      category: 'actions',
      icon: '🎯',
      shortcut: 'Ctrl+Shift+V',
      action: 'smart_paste'
    },
    {
      id: 'staging_area',
      title: 'Open Staging Area',
      description: 'Manage multi-item clipboard operations',
      category: 'clipboard',
      icon: '📋',
      shortcut: 'Ctrl+S',
      action: 'open_staging'
    },
    {
      id: 'pin_item',
      title: 'Pin Current Item',
      description: 'Pin the most recent clipboard item',
      category: 'clipboard',
      icon: '📌',
      shortcut: 'Ctrl+P',
      action: 'pin_current'
    },
    {
      id: 'generate_email',
      title: 'Generate Email',
      description: 'Create email from clipboard content',
      category: 'actions',
      icon: '✉️',
      action: 'generate_email'
    },
    {
      id: 'translate',
      title: 'Translate Text',
      description: 'Translate clipboard content',
      category: 'actions',
      icon: '🌐',
      action: 'translate'
    },
    {
      id: 'summarize',
      title: 'Summarize Content',
      description: 'Create bullet point summary',
      category: 'actions',
      icon: '📝',
      action: 'summarize'
    }
  ];

  async searchAll(userId: string, query: string, limit = 20): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      // Search clipboard items
      const clipboardResults = await this.searchClipboardItems(userId, query, limit);
      results.push(...clipboardResults);

      // Search collections
      const collectionResults = await this.searchCollections(userId, query, limit);
      results.push(...collectionResults);

      // Search commands
      const commandResults = this.searchCommands(query, limit);
      results.push(...commandResults);

      // Sort by relevance score
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      logger.error('Error in command palette search:', error);
      return [];
    }
  }

  private async searchClipboardItems(userId: string, query: string, limit: number): Promise<SearchResult[]> {
    const pool = getPool();
    
    const result = await pool.query(
      `SELECT *, 
              ts_rank(to_tsvector('english', content), plainto_tsquery('english', $2)) as rank
       FROM clipboard_items 
       WHERE user_id = $1 
         AND (content ILIKE $3 OR to_tsvector('english', content) @@ plainto_tsquery('english', $2))
       ORDER BY rank DESC, created_at DESC
       LIMIT $4`,
      [userId, query, `%${query}%`, limit]
    );

    return result.rows.map(row => ({
      type: 'item' as const,
      id: row.id,
      title: this.truncateText(row.content, 60),
      description: `${row.content_type} • ${new Date(row.created_at).toLocaleDateString()}`,
      content: row.content,
      score: row.rank || 0.5,
      metadata: {
        contentType: row.content_type,
        createdAt: row.created_at,
        isPinned: row.is_pinned
      }
    }));
  }

  private async searchCollections(userId: string, query: string, limit: number): Promise<SearchResult[]> {
    const pool = getPool();
    
    const result = await pool.query(
      `SELECT c.*, COUNT(ci.item_id) as item_count
       FROM clipboard_collections c
       LEFT JOIN collection_items ci ON c.id = ci.collection_id
       WHERE c.user_id = $1 
         AND (c.name ILIKE $2 OR c.description ILIKE $2)
       GROUP BY c.id
       ORDER BY c.updated_at DESC
       LIMIT $3`,
      [userId, `%${query}%`, limit]
    );

    return result.rows.map(row => ({
      type: 'collection' as const,
      id: row.id,
      title: row.name,
      description: `Collection • ${row.item_count} items`,
      score: 0.7, // Collections get medium priority
      metadata: {
        itemCount: row.item_count,
        autoGenerated: row.auto_generated
      }
    }));
  }

  private searchCommands(query: string, limit: number): SearchResult[] {
    const lowerQuery = query.toLowerCase();
    
    return this.commands
      .filter(cmd => 
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.description.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery)
      )
      .map(cmd => ({
        type: 'command' as const,
        id: cmd.id,
        title: cmd.title,
        description: `${cmd.description}${cmd.shortcut ? ` • ${cmd.shortcut}` : ''}`,
        score: 0.8, // Commands get high priority
        metadata: {
          category: cmd.category,
          action: cmd.action,
          shortcut: cmd.shortcut,
          icon: cmd.icon
        }
      }))
      .slice(0, limit);
  }

  async getContextualSuggestions(userId: string, currentContext?: string): Promise<SearchResult[]> {
    const suggestions: SearchResult[] = [];
    
    try {
      // Get recent items for context
      const pool = getPool();
      const recentItems = await pool.query(
        'SELECT * FROM clipboard_items WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
        [userId]
      );

      // Get pinned items
      const pinnedItems = await pool.query(
        'SELECT * FROM clipboard_items WHERE user_id = $1 AND is_pinned = true ORDER BY created_at DESC',
        [userId]
      );

      // Add pinned items as high-priority suggestions
      pinnedItems.rows.forEach(item => {
        suggestions.push({
          type: 'item',
          id: item.id,
          title: `📌 ${this.truncateText(item.content, 50)}`,
          description: 'Pinned item',
          content: item.content,
          score: 1.0,
          metadata: { isPinned: true, contentType: item.content_type }
        });
      });

      // Add contextual commands based on recent activity
      if (recentItems.rows.length > 0) {
        const lastItem = recentItems.rows[0];
        
        // Suggest actions based on content type
        if (lastItem.content_type === 'url') {
          suggestions.push({
            type: 'command',
            id: 'open_url',
            title: 'Open Last URL',
            description: 'Open the most recent URL in browser',
            score: 0.9,
            metadata: { action: 'open_url', targetId: lastItem.id }
          });
        }

        if (this.looksLikeCode(lastItem.content)) {
          suggestions.push({
            type: 'command',
            id: 'format_code',
            title: 'Format Code',
            description: 'Format and highlight the code snippet',
            score: 0.85,
            metadata: { action: 'format_code', targetId: lastItem.id }
          });
        }
      }

      // Add frequently used commands
      const frequentCommands = ['search_history', 'smart_paste', 'create_collection'];
      frequentCommands.forEach(cmdId => {
        const cmd = this.commands.find(c => c.id === cmdId);
        if (cmd) {
          suggestions.push({
            type: 'command',
            id: cmd.id,
            title: cmd.title,
            description: cmd.description,
            score: 0.7,
            metadata: { 
              action: cmd.action, 
              category: cmd.category,
              icon: cmd.icon,
              shortcut: cmd.shortcut
            }
          });
        }
      });

      return suggestions.sort((a, b) => b.score - a.score).slice(0, 10);
    } catch (error) {
      logger.error('Error getting contextual suggestions:', error);
      return [];
    }
  }

  async executeCommand(userId: string, commandId: string, params?: Record<string, any>): Promise<any> {
    const command = this.commands.find(cmd => cmd.id === commandId);
    if (!command) {
      throw new Error(`Command not found: ${commandId}`);
    }

    try {
      switch (command.action) {
        case 'search_history':
          return this.searchClipboardItems(userId, params?.query || '', 20);
        
        case 'create_collection':
          // This would integrate with collectionsService
          return { action: 'create_collection', params };
        
        case 'smart_paste':
          // This would integrate with stagingService
          return { action: 'smart_paste', params };
        
        case 'open_staging':
          // This would open the staging area UI
          return { action: 'open_staging', params };
        
        case 'pin_current':
          return this.pinMostRecentItem(userId);
        
        case 'generate_email':
          // This would integrate with generativeAiService
          return { action: 'generate_email', params };
        
        case 'translate':
          return { action: 'translate', params };
        
        case 'summarize':
          return { action: 'summarize', params };
        
        default:
          return { action: command.action, params };
      }
    } catch (error) {
      logger.error(`Error executing command ${commandId}:`, error);
      throw error;
    }
  }

  private async pinMostRecentItem(userId: string): Promise<any> {
    const pool = getPool();
    
    const result = await pool.query(
      `UPDATE clipboard_items 
       SET is_pinned = true, updated_at = NOW()
       WHERE id = (
         SELECT id FROM clipboard_items 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1
       )
       RETURNING *`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('No items to pin');
    }

    return {
      action: 'pin_item',
      success: true,
      item: result.rows[0]
    };
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  private looksLikeCode(content: string): boolean {
    const codeIndicators = [
      /function\s+\w+\s*\(/,
      /class\s+\w+/,
      /import\s+.+from/,
      /const\s+\w+\s*=/,
      /def\s+\w+\s*\(/,
      /<\w+[^>]*>/,
      /\{\s*\w+:\s*.+\}/
    ];

    return codeIndicators.some(pattern => pattern.test(content));
  }

  getAvailableCommands(): Command[] {
    return [...this.commands];
  }

  addCustomCommand(command: Omit<Command, 'id'>): Command {
    const newCommand: Command = {
      ...command,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.commands.push(newCommand);
    return newCommand;
  }

  removeCustomCommand(commandId: string): boolean {
    const index = this.commands.findIndex(cmd => cmd.id === commandId && cmd.id.startsWith('custom_'));
    if (index !== -1) {
      this.commands.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const commandPaletteService = new CommandPaletteService();