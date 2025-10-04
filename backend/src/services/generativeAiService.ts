import { ActionSuggestion, ActionType, ContentTransformation, DetectedEntity, ContentCategory, AIProcessingResult } from '../types';
import { logger } from '../utils/logger';
import { huggingFaceAI } from './huggingfaceAI';

class GenerativeAiService {
  private initialized = true;
  private aiServiceUrl = 'http://localhost:5001';
  private useAiService = false;

  constructor() {
    console.log('🤖 Generative AI Service initialized');
    this.checkAiService();
  }

  private async checkAiService() {
    try {
      const response = await fetch(`${this.aiServiceUrl}/health`);
      if (response.ok) {
        this.useAiService = true;
        console.log('✅ Python AI service connected');
      }
    } catch (error) {
      console.log('⚠️ Python AI service not available, using fallback methods');
      this.useAiService = false;
    }
  }

  private async callAiService(content: string, transformationType: string): Promise<string | null> {
    if (!this.useAiService) return null;
    
    try {
      const response = await fetch(`${this.aiServiceUrl}/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          transformationType
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.transformedContent;
      }
    } catch (error) {
      console.error('AI service error:', error);
      this.useAiService = false; // Fallback to rule-based
    }
    
    return null;
  }

  async processContent(content: string): Promise<AIProcessingResult> {
    const entities = this.extractEntities(content);
    const category = this.categorizeContent(content, entities);
    const transformations = await this.generateTransformations(content);
    const suggestions = await this.generateActionSuggestions(content, transformations);
    
    return {
      entities,
      category,
      suggestions,
      confidence: 0.8
    };
  }

  extractEntities(content: string): DetectedEntity[] {
    const entities: DetectedEntity[] = [];
    
    // Email detection
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    let match;
    while ((match = emailRegex.exec(content)) !== null) {
      entities.push({
        type: 'email',
        value: match[0],
        confidence: 0.9,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }

    // Phone detection
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    while ((match = phoneRegex.exec(content)) !== null) {
      entities.push({
        type: 'phone',
        value: match[0],
        confidence: 0.8,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }

    // URL detection
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    while ((match = urlRegex.exec(content)) !== null) {
      entities.push({
        type: 'url',
        value: match[0],
        confidence: 0.9,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }

    // Address detection
    const addressRegex = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)/gi;
    while ((match = addressRegex.exec(content)) !== null) {
      entities.push({
        type: 'address',
        value: match[0],
        confidence: 0.7,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }

    return entities;
  }

  categorizeContent(content: string, entities: DetectedEntity[]): ContentCategory {
    const hasEmail = entities.some(e => e.type === 'email');
    const hasPhone = entities.some(e => e.type === 'phone');
    const hasAddress = entities.some(e => e.type === 'address');
    const hasUrl = entities.some(e => e.type === 'url');

    // Code detection
    if (content.includes('function') || content.includes('const ') || content.includes('import ') || 
        content.includes('class ') || content.includes('def ') || content.includes('<?php')) {
      return 'code';
    }

    // Contact info
    if (hasEmail && hasPhone) {
      return 'contact';
    }

    // Location
    if (hasAddress) {
      return 'location';
    }

    // Document
    if (content.length > 200 && !hasUrl) {
      return 'document';
    }

    return 'other';
  }

  async generateTransformations(content: string): Promise<ContentTransformation[]> {
    if (!this.initialized) {
      return [];
    }

    try {
      const transformations: ContentTransformation[] = [];

      // Generate multiple transformations in parallel
      const [summary, professional, expanded, grammar] = await Promise.allSettled([
        this.summarizeToBullets(content),
        this.convertToProfessionalTone(content),
        this.expandIdea(content),
        this.fixGrammar(content)
      ]);

      if (summary.status === 'fulfilled' && summary.value) {
        transformations.push(summary.value);
      }
      if (professional.status === 'fulfilled' && professional.value) {
        transformations.push(professional.value);
      }
      if (expanded.status === 'fulfilled' && expanded.value) {
        transformations.push(expanded.value);
      }
      if (grammar.status === 'fulfilled' && grammar.value) {
        transformations.push(grammar.value);
      }

      return transformations;
    } catch (error) {
      logger.error('Error generating transformations:', error);
      return [];
    }
  }

  async generateEmail(content: string, context?: string): Promise<string> {
    // Generate professional email using rule-based approach
    const subject = this.generateEmailSubject(content);
    const body = await huggingFaceAI.makeProfessional(content);
    
    return `Subject: ${subject}

Dear [Recipient],

${body}

Best regards,
[Your Name]`;
  }

  async createTaskList(content: string): Promise<string> {
    // Create task list using rule-based approach
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const tasks = sentences.map((sentence, index) => {
      const task = sentence.trim();
      const actionWords = ['review', 'create', 'update', 'send', 'schedule', 'prepare', 'analyze'];
      
      if (!actionWords.some(word => task.toLowerCase().includes(word))) {
        return `${index + 1}. Review and address: ${task}`;
      }
      return `${index + 1}. ${task}`;
    });

    return tasks.join('\n');
  }

  private generateEmailSubject(content: string): string {
    const keywords = content.toLowerCase().match(/\b(meeting|project|update|request|proposal|issue|task|deadline)\b/g);
    if (keywords && keywords.length > 0) {
      const mainKeyword = keywords[0];
      return `Re: ${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)}`;
    }
    return 'Follow-up Required';
  }

  async summarizeToBullets(content: string): Promise<ContentTransformation | null> {
    if (content.length < 50) return null;

    // Try Hugging Face AI first
    try {
      const aiResult = await huggingFaceAI.summarizeText(content);
      if (aiResult && aiResult !== content) {
        return {
          id: `transform_${Date.now()}_summary`,
          type: 'summarize',
          originalContent: content,
          transformedContent: aiResult,
          confidence: 0.90,
          metadata: { bulletPoints: true, aiGenerated: true }
        };
      }
    } catch (error) {
      console.log('Hugging Face summarization failed, using fallback');
    }

    // Try Python AI service as backup
    const aiResult = await this.callAiService(content, 'summarize');
    if (aiResult) {
      return {
        id: `transform_${Date.now()}_summary`,
        type: 'summarize',
        originalContent: content,
        transformedContent: aiResult,
        confidence: 0.90,
        metadata: { bulletPoints: true, aiGenerated: true }
      };
    }

    // Fallback to rule-based summarization
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length < 2) return null;

    const keyWords = ['important', 'key', 'main', 'significant', 'crucial', 'essential', 'note', 'remember', 'must', 'should', 'will', 'need'];
    const numbers = /\d+/;
    const caps = /[A-Z]{2,}/;
    
    const scoredSentences = sentences.map(sentence => {
      let score = 0;
      const lower = sentence.toLowerCase();
      
      keyWords.forEach(word => {
        if (lower.includes(word)) score += 2;
      });
      
      if (numbers.test(sentence)) score += 1;
      if (caps.test(sentence)) score += 1;
      
      if (sentences.indexOf(sentence) === 0 || sentences.indexOf(sentence) === sentences.length - 1) {
        score += 1;
      }
      
      if (sentence.length < 30) score -= 1;
      
      return { sentence: sentence.trim(), score };
    });

    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(5, Math.ceil(sentences.length * 0.4)))
      .map(item => `• ${item.sentence}`)
      .join('\n');

    return {
      id: `transform_${Date.now()}_summary`,
      type: 'summarize',
      originalContent: content,
      transformedContent: topSentences,
      confidence: 0.75,
      metadata: { bulletPoints: true, aiGenerated: false }
    };
  }

  async convertToProfessionalTone(content: string): Promise<ContentTransformation | null> {
    // Try Hugging Face AI first
    try {
      const aiResult = await huggingFaceAI.makeProfessional(content);
      if (aiResult && aiResult !== content) {
        return {
          id: `transform_${Date.now()}_professional`,
          type: 'tone_change',
          originalContent: content,
          transformedContent: aiResult,
          confidence: 0.90,
          metadata: { tone: 'professional', aiGenerated: true }
        };
      }
    } catch (error) {
      console.log('Hugging Face professional tone failed, using fallback');
    }

    // Try Python AI service as backup
    const aiResult = await this.callAiService(content, 'professional');
    if (aiResult) {
      return {
        id: `transform_${Date.now()}_professional`,
        type: 'tone_change',
        originalContent: content,
        transformedContent: aiResult,
        confidence: 0.90,
        metadata: { tone: 'professional', aiGenerated: true }
      };
    }

    // Fallback to rule-based professional conversion
    let professional = content;
    
    const replacements = [
      { casual: /\bhi\b/gi, professional: 'Hello' },
      { casual: /\bhey\b/gi, professional: 'Hello' },
      { casual: /\byeah\b/gi, professional: 'Yes' },
      { casual: /\byep\b/gi, professional: 'Yes' },
      { casual: /\bnope\b/gi, professional: 'No' },
      { casual: /\bokay\b/gi, professional: 'Understood' },
      { casual: /\bok\b/gi, professional: 'Acknowledged' },
      { casual: /\bthanks\b/gi, professional: 'Thank you' },
      { casual: /\bthx\b/gi, professional: 'Thank you' },
      { casual: /\bbtw\b/gi, professional: 'Additionally' },
      { casual: /\bfyi\b/gi, professional: 'For your information' },
      { casual: /\basap\b/gi, professional: 'as soon as possible' },
      { casual: /\bcan't\b/gi, professional: 'cannot' },
      { casual: /\bwon't\b/gi, professional: 'will not' },
      { casual: /\bdon't\b/gi, professional: 'do not' },
      { casual: /\bisn't\b/gi, professional: 'is not' },
      { casual: /\bwanna\b/gi, professional: 'would like to' },
      { casual: /\bgonna\b/gi, professional: 'going to' },
    ];
    
    replacements.forEach(({ casual, professional: prof }) => {
      professional = professional.replace(casual, prof);
    });
    
    if (professional.length < 100 && !professional.includes('Dear') && !professional.includes('Hello')) {
      const starters = [
        'I would like to inform you that',
        'Please be advised that',
        'I am writing to let you know that',
        'This is to confirm that',
        'I wanted to bring to your attention that'
      ];
      const starter = starters[Math.floor(Math.random() * starters.length)];
      professional = `${starter} ${professional.toLowerCase()}`;
    }
    
    professional = professional.charAt(0).toUpperCase() + professional.slice(1);
    
    if (professional.length > 100 && !professional.includes('Best regards') && !professional.includes('Sincerely')) {
      professional += '\n\nBest regards';
    }

    return {
      id: `transform_${Date.now()}_professional`,
      type: 'tone_change',
      originalContent: content,
      transformedContent: professional,
      confidence: 0.75,
      metadata: { tone: 'professional', aiGenerated: false }
    };
  }

  async expandIdea(content: string): Promise<ContentTransformation | null> {
    if (content.length > 400) return null;

    // Try Hugging Face AI first
    try {
      const aiResult = await huggingFaceAI.expandText(content);
      if (aiResult && aiResult !== content) {
        return {
          id: `transform_${Date.now()}_expand`,
          type: 'expand',
          originalContent: content,
          transformedContent: aiResult,
          confidence: 0.85,
          metadata: { expanded: true, aiGenerated: true }
        };
      }
    } catch (error) {
      console.log('Hugging Face text expansion failed, using fallback');
    }

    // Try Python AI service as backup
    const aiResult = await this.callAiService(content, 'expand');
    if (aiResult) {
      return {
        id: `transform_${Date.now()}_expand`,
        type: 'expand',
        originalContent: content,
        transformedContent: aiResult,
        confidence: 0.85,
        metadata: { expanded: true, aiGenerated: true }
      };
    }

    // Fallback to rule-based expansion
    let expanded = content;
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('meeting') || lowerContent.includes('call')) {
      expanded += '\n\nKey considerations for this meeting:\n• Agenda preparation\n• Participant availability\n• Required materials or documents\n• Follow-up action items';
    } else if (lowerContent.includes('project') || lowerContent.includes('task')) {
      expanded += '\n\nProject planning considerations:\n• Timeline and milestones\n• Resource requirements\n• Potential risks and mitigation strategies\n• Success metrics and deliverables';
    } else if (lowerContent.includes('idea') || lowerContent.includes('concept')) {
      expanded += '\n\nTo develop this idea further:\n• Research existing solutions or approaches\n• Identify target audience or stakeholders\n• Consider implementation challenges\n• Evaluate potential benefits and outcomes';
    } else if (lowerContent.includes('problem') || lowerContent.includes('issue')) {
      expanded += '\n\nProblem-solving approach:\n• Root cause analysis\n• Alternative solutions\n• Impact assessment\n• Implementation timeline';
    } else {
      const expansionTemplates = [
        '\n\nAdditional context to consider:\n• Background information and relevant history\n• Stakeholder perspectives and requirements\n• Potential challenges and opportunities\n• Next steps and recommended actions',
        '\n\nKey factors to explore:\n• Current situation analysis\n• Available resources and constraints\n• Success criteria and measurements\n• Timeline and priority considerations',
        '\n\nImportant aspects to address:\n• Scope and boundaries\n• Dependencies and prerequisites\n• Risk assessment and mitigation\n• Communication and coordination needs'
      ];
      
      expanded += expansionTemplates[Math.floor(Math.random() * expansionTemplates.length)];
    }

    return {
      id: `transform_${Date.now()}_expand`,
      type: 'expand',
      originalContent: content,
      transformedContent: expanded,
      confidence: 0.70,
      metadata: { expanded: true, aiGenerated: false }
    };
  }

  async fixGrammar(content: string): Promise<ContentTransformation | null> {
    let corrected = content;
    let changesMade = false;
    
    // Common grammar and spelling fixes
    const corrections = [
      // Common spelling mistakes
      { wrong: /\bteh\b/gi, correct: 'the' },
      { wrong: /\brecieve\b/gi, correct: 'receive' },
      { wrong: /\boccur\b/gi, correct: 'occur' },
      { wrong: /\bseperate\b/gi, correct: 'separate' },
      { wrong: /\bdefinately\b/gi, correct: 'definitely' },
      { wrong: /\balot\b/gi, correct: 'a lot' },
      { wrong: /\bthier\b/gi, correct: 'their' },
      { wrong: /\byour\s+welcome\b/gi, correct: "you're welcome" },
      { wrong: /\bits\s+ok\b/gi, correct: "it's ok" },
      { wrong: /\bcant\b/gi, correct: "can't" },
      { wrong: /\bwont\b/gi, correct: "won't" },
      { wrong: /\bdont\b/gi, correct: "don't" },
      
      // Grammar fixes
      { wrong: /\bi\s+/g, correct: 'I ' }, // Capitalize I
      { wrong: /\s+,/g, correct: ',' }, // Remove space before comma
      { wrong: /\s+\./g, correct: '.' }, // Remove space before period
      { wrong: /\s{2,}/g, correct: ' ' }, // Multiple spaces to single
      { wrong: /\s+$/gm, correct: '' }, // Trailing spaces
    ];
    
    corrections.forEach(({ wrong, correct }) => {
      const before = corrected;
      corrected = corrected.replace(wrong, correct);
      if (before !== corrected) changesMade = true;
    });
    
    // Capitalize first letter of sentences
    corrected = corrected.replace(/(^|[.!?]\s+)([a-z])/g, (match, prefix, letter) => {
      changesMade = true;
      return prefix + letter.toUpperCase();
    });
    
    // Fix double punctuation
    const beforePunct = corrected;
    corrected = corrected.replace(/([.!?]){2,}/g, '$1');
    if (beforePunct !== corrected) changesMade = true;
    
    if (!changesMade) return null;

    return {
      id: `transform_${Date.now()}_grammar`,
      type: 'grammar_fix',
      originalContent: content,
      transformedContent: corrected,
      confidence: 0.90,
      metadata: { corrected: true }
    };
  }

  async translateText(content: string, targetLanguage: string): Promise<string> {
    // For now, return original content with note about translation
    // Could integrate with Google Translate API or other translation service
    return `[Translation to ${targetLanguage} not available - original text]: ${content}`;
  }

  async generateActionSuggestions(content: string, transformations: ContentTransformation[]): Promise<ActionSuggestion[]> {
    const suggestions: ActionSuggestion[] = [];

    // Add generative suggestions based on content
    if (this.looksLikeIdea(content)) {
      suggestions.push({
        id: 'gen_email',
        type: 'generate_email',
        title: 'Draft Email',
        description: 'Create a professional email about this topic',
        icon: '✉️',
        confidence: 0.8,
        metadata: { generative: true }
      });

      suggestions.push({
        id: 'gen_tasks',
        type: 'create_task_list',
        title: 'Create Task List',
        description: 'Break this down into actionable tasks',
        icon: '✅',
        confidence: 0.85,
        metadata: { generative: true }
      });
    }

    // Add transformation suggestions
    transformations.forEach(transform => {
      suggestions.push({
        id: `suggest_${transform.id}`,
        type: this.getActionTypeForTransform(transform.type),
        title: this.getTitleForTransform(transform.type),
        description: `Transform: ${transform.transformedContent.substring(0, 50)}...`,
        icon: this.getIconForTransform(transform.type),
        confidence: transform.confidence,
        metadata: { transformation: transform }
      });
    });

    return suggestions;
  }

  private looksLikeIdea(content: string): boolean {
    const ideaKeywords = ['idea', 'concept', 'plan', 'project', 'proposal', 'strategy', 'approach'];
    const lowerContent = content.toLowerCase();
    return ideaKeywords.some(keyword => lowerContent.includes(keyword)) || content.length > 50;
  }

  private getActionTypeForTransform(transformType: string): ActionType {
    const mapping: Record<string, ActionType> = {
      'summarize': 'summarize_bullets',
      'tone_change': 'professional_tone',
      'expand': 'expand_idea',
      'grammar_fix': 'fix_grammar',
      'format': 'smart_paste'
    };
    return mapping[transformType] || 'create_note';
  }

  private getTitleForTransform(transformType: string): string {
    const titles: Record<string, string> = {
      'summarize': 'Summarize to Bullets',
      'tone_change': 'Make Professional',
      'expand': 'Expand Idea',
      'grammar_fix': 'Fix Grammar',
      'format': 'Smart Format'
    };
    return titles[transformType] || 'Transform';
  }

  private getIconForTransform(transformType: string): string {
    const icons: Record<string, string> = {
      'summarize': '📝',
      'tone_change': '👔',
      'expand': '🔍',
      'grammar_fix': '✏️',
      'format': '🎨'
    };
    return icons[transformType] || '⚡';
  }
}

export const generativeAiService = new GenerativeAiService();