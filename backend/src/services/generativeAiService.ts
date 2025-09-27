import { OpenAI } from 'openai';
import { ActionSuggestion, ActionType, ContentTransformation } from '../types';
import { logger } from '../utils/logger';

class GenerativeAiService {
  private openai!: OpenAI;
  private initialized = false;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.initialized = true;
    }
  }

  async generateTransformations(content: string, contentType: string): Promise<ContentTransformation[]> {
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
    if (!this.initialized) {
      throw new Error('OpenAI not initialized');
    }

    const prompt = `Based on this content: "${content}"
    ${context ? `Context: ${context}` : ''}
    
    Generate a professional email. Include:
    - Appropriate subject line
    - Professional greeting
    - Clear, concise body
    - Professional closing
    
    Format as a complete email ready to send.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  }

  async createTaskList(content: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('OpenAI not initialized');
    }

    const prompt = `Based on this content: "${content}"
    
    Create a detailed task list with:
    - Clear, actionable tasks
    - Logical order/priority
    - Estimated time if relevant
    - Sub-tasks where appropriate
    
    Format as a numbered list.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.6,
    });

    return response.choices[0]?.message?.content || '';
  }

  private async summarizeToBullets(content: string): Promise<ContentTransformation | null> {
    if (content.length < 100) return null; // Too short to summarize

    const prompt = `Summarize this content into clear bullet points:
    "${content}"
    
    Create 3-5 concise bullet points that capture the key information.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.5,
    });

    const transformed = response.choices[0]?.message?.content;
    if (!transformed) return null;

    return {
      id: `transform_${Date.now()}_summary`,
      type: 'summarize',
      originalContent: content,
      transformedContent: transformed,
      confidence: 0.85,
      metadata: { bulletPoints: true }
    };
  }

  private async convertToProfessionalTone(content: string): Promise<ContentTransformation | null> {
    const prompt = `Rewrite this content in a professional, business-appropriate tone:
    "${content}"
    
    Maintain the core message but make it suitable for professional communication.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: Math.min(content.length * 2, 400),
      temperature: 0.4,
    });

    const transformed = response.choices[0]?.message?.content;
    if (!transformed) return null;

    return {
      id: `transform_${Date.now()}_professional`,
      type: 'tone_change',
      originalContent: content,
      transformedContent: transformed,
      confidence: 0.80,
      metadata: { tone: 'professional' }
    };
  }

  private async expandIdea(content: string): Promise<ContentTransformation | null> {
    if (content.length > 500) return null; // Already detailed enough

    const prompt = `Expand on this idea with more detail and context:
    "${content}"
    
    Provide additional insights, examples, or elaboration while keeping it focused.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const transformed = response.choices[0]?.message?.content;
    if (!transformed) return null;

    return {
      id: `transform_${Date.now()}_expand`,
      type: 'expand',
      originalContent: content,
      transformedContent: transformed,
      confidence: 0.75,
      metadata: { expanded: true }
    };
  }

  private async fixGrammar(content: string): Promise<ContentTransformation | null> {
    const prompt = `Fix any grammar, spelling, or punctuation errors in this text:
    "${content}"
    
    Only make necessary corrections. If no errors, return the original text.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: Math.min(content.length * 1.5, 400),
      temperature: 0.2,
    });

    const transformed = response.choices[0]?.message?.content;
    if (!transformed || transformed === content) return null;

    return {
      id: `transform_${Date.now()}_grammar`,
      type: 'grammar_fix',
      originalContent: content,
      transformedContent: transformed,
      confidence: 0.90,
      metadata: { corrected: true }
    };
  }

  async translateText(content: string, targetLanguage: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('OpenAI not initialized');
    }

    const prompt = `Translate this text to ${targetLanguage}:
    "${content}"
    
    Provide only the translation, maintaining the original meaning and tone.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: Math.min(content.length * 2, 400),
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || content;
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