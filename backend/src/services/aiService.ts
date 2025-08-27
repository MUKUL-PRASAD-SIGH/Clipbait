import { DetectedEntity, ActionSuggestion, AIProcessingResult, ContentCategory } from '../types';
import { logger } from '../utils/logger';

class AIService {
  private initialized = false;

  async initialize(): Promise<void> {
    try {
      // In production, load ONNX model here
      // For now, use rule-based classification
      this.initialized = true;
      logger.info('AI Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI Service:', error);
      this.initialized = true; // Fallback to rule-based
    }
  }

  async processContent(content: string, contentType: string = 'text'): Promise<AIProcessingResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const entities = await this.classifyText(content);
    const category = this.categorizeContent(content, entities);
    const suggestions = this.generateSuggestions(entities);
    const confidence = this.calculateConfidence(entities, suggestions);

    return {
      entities,
      category,
      suggestions,
      confidence
    };
  }

  async classifyText(text: string): Promise<DetectedEntity[]> {
    const entities: DetectedEntity[] = [];

    // Email detection
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    let match;
    while ((match = emailRegex.exec(text)) !== null) {
      entities.push({
        type: 'email',
        value: match[0],
        confidence: 0.95,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    // Phone number detection
    const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    while ((match = phoneRegex.exec(text)) !== null) {
      entities.push({
        type: 'phone',
        value: match[0],
        confidence: 0.9,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    // URL detection
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    while ((match = urlRegex.exec(text)) !== null) {
      entities.push({
        type: 'url',
        value: match[0],
        confidence: 0.98,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    // Date detection
    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
    while ((match = dateRegex.exec(text)) !== null) {
      entities.push({
        type: 'date',
        value: match[0],
        confidence: 0.85,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    // Address detection
    const addressRegex = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)/gi;
    while ((match = addressRegex.exec(text)) !== null) {
      entities.push({
        type: 'address',
        value: match[0],
        confidence: 0.8,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    return entities;
  }

  private categorizeContent(text: string, entities: DetectedEntity[]): ContentCategory {
    const entityTypes = entities.map(e => e.type);
    
    if (entityTypes.includes('email') && entityTypes.includes('phone')) {
      return 'contact';
    }
    
    if (entityTypes.includes('date')) {
      return 'event';
    }
    
    if (entityTypes.includes('address')) {
      return 'location';
    }
    
    if (entityTypes.includes('url')) {
      return 'document';
    }
    
    // Check for code patterns
    if (text.includes('function') || text.includes('class') || text.includes('import')) {
      return 'code';
    }
    
    return 'other';
  }

  generateSuggestions(entities: DetectedEntity[]): ActionSuggestion[] {
    const suggestions: ActionSuggestion[] = [];

    entities.forEach((entity, index) => {
      switch (entity.type) {
        case 'email':
          suggestions.push({
            id: `email_${index}`,
            type: 'send_email',
            title: 'Send Email',
            description: `Send email to ${entity.value}`,
            icon: 'mail',
            confidence: entity.confidence,
            metadata: { email: entity.value },
          });
          break;

        case 'phone':
          suggestions.push({
            id: `call_${index}`,
            type: 'call_phone',
            title: 'Call Number',
            description: `Call ${entity.value}`,
            icon: 'call',
            confidence: entity.confidence,
            metadata: { phone: entity.value },
          });
          break;

        case 'url':
          suggestions.push({
            id: `url_${index}`,
            type: 'open_url',
            title: 'Open Link',
            description: `Open ${entity.value}`,
            icon: 'open-outline',
            confidence: entity.confidence,
            metadata: { url: entity.value },
          });
          break;

        case 'date':
          suggestions.push({
            id: `event_${index}`,
            type: 'create_event',
            title: 'Create Event',
            description: `Create calendar event for ${entity.value}`,
            icon: 'calendar',
            confidence: entity.confidence,
            metadata: { date: entity.value },
          });
          break;

        case 'address':
          suggestions.push({
            id: `maps_${index}`,
            type: 'open_maps',
            title: 'Open in Maps',
            description: `Navigate to ${entity.value}`,
            icon: 'map',
            confidence: entity.confidence,
            metadata: { address: entity.value },
          });
          break;
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateConfidence(entities: DetectedEntity[], suggestions: ActionSuggestion[]): number {
    if (entities.length === 0) return 0.3;
    
    const avgEntityConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
    return avgEntityConfidence;
  }
}

export const aiService = new AIService();