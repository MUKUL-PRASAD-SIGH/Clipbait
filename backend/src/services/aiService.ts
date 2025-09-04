import { DetectedEntity, ActionSuggestion, AIProcessingResult, ContentCategory } from '../types';
import { logger } from '../utils/logger';
import OpenAI from 'openai';

class AIService {
  private initialized = false;
  private openai: OpenAI | null = null;
  private useAI = false;

  async initialize(): Promise<void> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey) {
        this.openai = new OpenAI({ apiKey });
        this.useAI = true;
        logger.info('AI Service initialized with OpenAI');
      } else {
        logger.info('AI Service initialized with rule-based classification only');
      }
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize AI Service:', error);
      this.initialized = true; // Fallback to rule-based
    }
  }

  async processContent(content: string, contentType: string = 'text'): Promise<AIProcessingResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Try AI-powered analysis first, fallback to rule-based
    if (this.useAI && this.openai) {
      try {
        return await this.processWithAI(content);
      } catch (error) {
        logger.warn('AI processing failed, falling back to rule-based:', error);
      }
    }

    // Rule-based fallback
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

  private async processWithAI(content: string): Promise<AIProcessingResult> {
    const prompt = `Analyze this clipboard content and extract actionable information:

Content: "${content}"

Please respond with a JSON object containing:
1. entities: Array of detected entities (email, phone, url, date, address, etc.) with their positions
2. category: One of: contact, event, location, document, code, other
3. suggestions: Array of suggested actions the user might want to take
4. confidence: Overall confidence score (0-1)

Focus on practical actions like "send email", "call number", "open link", "create calendar event", "open in maps", etc.

Response format:
{
  "entities": [{"type": "email", "value": "example@email.com", "confidence": 0.95, "startIndex": 0, "endIndex": 15}],
  "category": "contact",
  "suggestions": [{"id": "email_1", "type": "send_email", "title": "Send Email", "description": "Send email to example@email.com", "icon": "mail", "confidence": 0.95, "metadata": {"email": "example@email.com"}}],
  "confidence": 0.9
}`;

    const response = await this.openai!.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error('No response from AI');

    try {
      const parsed = JSON.parse(result);
      return {
        entities: parsed.entities || [],
        category: parsed.category || 'other',
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.5
      };
    } catch (parseError) {
      logger.error('Failed to parse AI response:', parseError);
      throw parseError;
    }
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
          suggestions.push({
            id: `outlook_${index}`,
            type: 'open_app',
            title: 'Open in Outlook',
            description: `Compose email in Outlook`,
            icon: 'mail-outline',
            confidence: entity.confidence * 0.9,
            metadata: { app: 'outlook', email: entity.value },
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
          suggestions.push({
            id: `whatsapp_${index}`,
            type: 'open_app',
            title: 'Open in WhatsApp',
            description: `Message on WhatsApp`,
            icon: 'logo-whatsapp',
            confidence: entity.confidence * 0.8,
            metadata: { app: 'whatsapp', phone: entity.value },
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
          
          // Suggest specific apps based on URL
          if (entity.value.includes('github.com')) {
            suggestions.push({
              id: `github_${index}`,
              type: 'open_app',
              title: 'Open in GitHub Desktop',
              description: 'Open repository in GitHub Desktop',
              icon: 'logo-github',
              confidence: entity.confidence * 0.9,
              metadata: { app: 'github-desktop', url: entity.value },
            });
          } else if (entity.value.includes('youtube.com') || entity.value.includes('youtu.be')) {
            suggestions.push({
              id: `youtube_${index}`,
              type: 'open_app',
              title: 'Open in YouTube App',
              description: 'Watch in YouTube app',
              icon: 'logo-youtube',
              confidence: entity.confidence * 0.9,
              metadata: { app: 'youtube', url: entity.value },
            });
          }
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
          suggestions.push({
            id: `calendar_${index}`,
            type: 'open_app',
            title: 'Open Calendar App',
            description: 'Add to calendar app',
            icon: 'calendar-outline',
            confidence: entity.confidence * 0.9,
            metadata: { app: 'calendar', date: entity.value },
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
          suggestions.push({
            id: `googlemaps_${index}`,
            type: 'open_app',
            title: 'Open in Google Maps',
            description: 'Navigate with Google Maps',
            icon: 'navigate',
            confidence: entity.confidence * 0.9,
            metadata: { app: 'google-maps', address: entity.value },
          });
          break;

        case 'code':
          suggestions.push({
            id: `vscode_${index}`,
            type: 'open_app',
            title: 'Open in VS Code',
            description: 'Edit code in VS Code',
            icon: 'code-slash',
            confidence: 0.9,
            metadata: { app: 'vscode', content: entity.value },
          });
          break;
      }
    });

    // Add content-type based suggestions
    const contentSuggestions = this.generateContentTypeSuggestions(entities);
    suggestions.push(...contentSuggestions);

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private generateContentTypeSuggestions(entities: DetectedEntity[]): ActionSuggestion[] {
    const suggestions: ActionSuggestion[] = [];
    const entityTypes = entities.map(e => e.type);

    // If it looks like code, suggest development tools
    if (entityTypes.includes('code') || entities.some(e => e.value.includes('function') || e.value.includes('class'))) {
      suggestions.push({
        id: 'open_ide',
        type: 'open_app',
        title: 'Open in IDE',
        description: 'Open code in your preferred IDE',
        icon: 'code-working',
        confidence: 0.85,
        metadata: { app: 'ide', contentType: 'code' },
      });
    }

    // If it contains multiple contacts, suggest CRM
    if (entityTypes.filter(t => t === 'email' || t === 'phone').length > 1) {
      suggestions.push({
        id: 'add_contacts',
        type: 'open_app',
        title: 'Add to Contacts',
        description: 'Import contacts to address book',
        icon: 'people',
        confidence: 0.8,
        metadata: { app: 'contacts', contentType: 'contact-list' },
      });
    }

    return suggestions;
  }

  private calculateConfidence(entities: DetectedEntity[], suggestions: ActionSuggestion[]): number {
    if (entities.length === 0) return 0.3;
    
    const avgEntityConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
    return avgEntityConfidence;
  }
}

export const aiService = new AIService();