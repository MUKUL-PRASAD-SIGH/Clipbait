import { HfInference } from '@huggingface/inference';

class HuggingFaceAI {
  private hf: HfInference | null = null;
  private initialized = false;

  constructor() {
    // Hugging Face works without API key for public models
    this.hf = new HfInference();
    this.initialized = true;
    console.log('🤖 Hugging Face AI initialized (free tier)');
  }

  async summarizeText(text: string): Promise<string> {
    if (!this.initialized || !this.hf) {
      return this.fallbackSummarize(text);
    }

    try {
      // Use Facebook's BART model for summarization (free)
      const result = await this.hf.summarization({
        model: 'facebook/bart-large-cnn',
        inputs: text,
        parameters: {
          max_length: Math.min(150, Math.floor(text.length * 0.3)),
          min_length: 30,
          do_sample: false
        }
      });

      if (result.summary_text) {
        // Convert to bullet points
        const sentences = result.summary_text.split('. ');
        return sentences.map((s: string) => `• ${s.trim()}`).join('\n');
      }
      
      return this.fallbackSummarize(text);
    } catch (error) {
      console.log('⚠️ Hugging Face API failed, using fallback:', error);
      return this.fallbackSummarize(text);
    }
  }

  async makeProfessional(text: string): Promise<string> {
    if (!this.initialized || !this.hf) {
      return this.fallbackProfessional(text);
    }

    try {
      // Use text generation for professional tone
      const result = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: `Rewrite this text in a professional business tone: "${text}"`,
        parameters: {
          max_new_tokens: Math.min(200, text.length + 50),
          temperature: 0.7,
          return_full_text: false
        }
      });

      if (result.generated_text) {
        return result.generated_text.trim();
      }
      
      return this.fallbackProfessional(text);
    } catch (error) {
      console.log('⚠️ Professional tone generation failed, using fallback');
      return this.fallbackProfessional(text);
    }
  }

  async expandText(text: string): Promise<string> {
    if (!this.initialized || !this.hf) {
      return this.fallbackExpand(text);
    }

    try {
      const result = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: `Expand this idea with more details and context: "${text}"`,
        parameters: {
          max_new_tokens: Math.min(300, text.length * 2),
          temperature: 0.8,
          return_full_text: false
        }
      });

      if (result.generated_text) {
        return `${text}\n\n${result.generated_text.trim()}`;
      }
      
      return this.fallbackExpand(text);
    } catch (error) {
      console.log('⚠️ Text expansion failed, using fallback');
      return this.fallbackExpand(text);
    }
  }

  // Fallback methods (smart rule-based)
  private fallbackSummarize(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length < 2) return `• ${text}`;

    // Smart extraction of key sentences
    const keyWords = ['important', 'key', 'main', 'significant', 'crucial', 'essential', 'note', 'remember', 'must', 'should', 'will', 'need'];
    
    const scoredSentences = sentences.map(sentence => {
      let score = 0;
      const lower = sentence.toLowerCase();
      
      keyWords.forEach(word => {
        if (lower.includes(word)) score += 2;
      });
      
      if (/\d+/.test(sentence)) score += 1;
      if (/[A-Z]{2,}/.test(sentence)) score += 1;
      if (sentences.indexOf(sentence) === 0) score += 1;
      if (sentence.length < 30) score -= 1;
      
      return { sentence: sentence.trim(), score };
    });

    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(4, Math.ceil(sentences.length * 0.4)))
      .map(item => `• ${item.sentence}`)
      .join('\n');

    return topSentences;
  }

  private fallbackProfessional(text: string): string {
    let professional = text;
    
    const replacements = [
      { casual: /\bhi\b/gi, professional: 'Hello' },
      { casual: /\bhey\b/gi, professional: 'Hello' },
      { casual: /\byeah\b/gi, professional: 'Yes' },
      { casual: /\bokay\b/gi, professional: 'Understood' },
      { casual: /\bthanks\b/gi, professional: 'Thank you' },
      { casual: /\bcan't\b/gi, professional: 'cannot' },
      { casual: /\bwon't\b/gi, professional: 'will not' },
      { casual: /\bdon't\b/gi, professional: 'do not' },
    ];
    
    replacements.forEach(({ casual, professional: prof }) => {
      professional = professional.replace(casual, prof);
    });
    
    if (professional.length < 100) {
      professional = `I would like to inform you that ${professional.toLowerCase()}`;
    }
    
    professional = professional.charAt(0).toUpperCase() + professional.slice(1);
    
    if (professional.length > 100) {
      professional += '\n\nBest regards';
    }

    return professional;
  }

  private fallbackExpand(text: string): string {
    const expansions = [
      '\n\nTo elaborate further, this topic encompasses several important considerations that merit detailed examination.',
      '\n\nAdditional context includes relevant background information and potential implications for stakeholders.',
      '\n\nThis concept can be further developed by exploring related aspects and considering multiple perspectives.',
    ];
    
    return text + expansions[Math.floor(Math.random() * expansions.length)];
  }
}

export const huggingFaceAI = new HuggingFaceAI();