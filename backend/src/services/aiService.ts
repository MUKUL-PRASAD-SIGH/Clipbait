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

    // Improved email detection
    const emailRegex = /\b[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\b/g;
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

    // Improved international phone number detection
    const phonePatterns = [
      // International format: +1-555-123-4567, +44 20 7946 0958
      /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      // US format: (555) 123-4567, 555-123-4567, 555.123.4567
      /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      // UK format: 020 7946 0958
      /\b\d{3,4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
    ];

    phonePatterns.forEach(regex => {
      while ((match = regex.exec(text)) !== null) {
        // Validate it's actually a phone number (not just random digits)
        const cleaned = match[0].replace(/\D/g, '');
        if (cleaned.length >= 7 && cleaned.length <= 15) {
          entities.push({
            type: 'phone',
            value: match[0],
            confidence: 0.9,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
          });
        }
      }
    });

    // Improved URL detection
    const urlRegex = /https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?/g;
    while ((match = urlRegex.exec(text)) !== null) {
      entities.push({
        type: 'url',
        value: match[0],
        confidence: 0.98,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    // Improved date detection (multiple formats)
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // MM/DD/YYYY
      /\b\d{4}-\d{2}-\d{2}\b/g, // YYYY-MM-DD
      /\b\d{1,2}-\d{1,2}-\d{4}\b/g, // MM-DD-YYYY
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi, // Month DD, YYYY
    ];

    datePatterns.forEach(regex => {
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          type: 'date',
          value: match[0],
          confidence: 0.85,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    });

    // Improved address detection
    const addressPatterns = [
      // US addresses: 123 Main Street, 456 Oak Ave
      /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Place|Pl|Court|Ct|Circle|Cir)(?:\s+[A-Za-z\s]*)?/gi,
      // International addresses with postal codes
      /\d+\s+[A-Za-z\s]+,\s*[A-Za-z\s]+,?\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?/gi,
    ];

    addressPatterns.forEach(regex => {
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          type: 'address',
          value: match[0],
          confidence: 0.8,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    });

    // Credit card detection (for security flagging)
    const creditCardRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
    while ((match = creditCardRegex.exec(text)) !== null) {
      entities.push({
        type: 'credit_card',
        value: match[0],
        confidence: 0.9,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    // Remove duplicates and overlapping matches
    return this.removeDuplicateEntities(entities);
  }

  private removeDuplicateEntities(entities: DetectedEntity[]): DetectedEntity[] {
    const filtered: DetectedEntity[] = [];
    
    entities.sort((a, b) => a.startIndex - b.startIndex);
    
    for (const entity of entities) {
      const overlapping = filtered.find(existing => 
        (entity.startIndex >= existing.startIndex && entity.startIndex < existing.endIndex) ||
        (entity.endIndex > existing.startIndex && entity.endIndex <= existing.endIndex)
      );
      
      if (!overlapping) {
        filtered.push(entity);
      } else if (entity.confidence > overlapping.confidence) {
        // Replace with higher confidence entity
        const index = filtered.indexOf(overlapping);
        filtered[index] = entity;
      }
    }
    
    return filtered;
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