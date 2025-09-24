import { getPool } from '../database/connection';
import { StagingArea, ClipboardItem, SmartPasteFormat } from '../../../shared/types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

class StagingService {
  private userStagingAreas = new Map<string, StagingArea>();

  async createStagingArea(userId: string, targetFormat: StagingArea['targetFormat']): Promise<StagingArea> {
    const stagingArea: StagingArea = {
      id: uuidv4(),
      userId,
      items: [],
      targetFormat,
      createdAt: new Date().toISOString()
    };

    this.userStagingAreas.set(userId, stagingArea);
    return stagingArea;
  }

  async addToStaging(userId: string, item: ClipboardItem): Promise<StagingArea> {
    let stagingArea = this.userStagingAreas.get(userId);
    
    if (!stagingArea) {
      // Auto-detect target format based on content
      const targetFormat = this.detectTargetFormat(item);
      stagingArea = await this.createStagingArea(userId, targetFormat);
    }

    // Avoid duplicates
    const exists = stagingArea.items.some(existing => existing.id === item.id);
    if (!exists) {
      stagingArea.items.push(item);
      this.userStagingAreas.set(userId, stagingArea);
    }

    return stagingArea;
  }

  async removeFromStaging(userId: string, itemId: string): Promise<StagingArea | null> {
    const stagingArea = this.userStagingAreas.get(userId);
    if (!stagingArea) return null;

    stagingArea.items = stagingArea.items.filter(item => item.id !== itemId);
    
    if (stagingArea.items.length === 0) {
      this.userStagingAreas.delete(userId);
      return null;
    }

    this.userStagingAreas.set(userId, stagingArea);
    return stagingArea;
  }

  async getStagingArea(userId: string): Promise<StagingArea | null> {
    return this.userStagingAreas.get(userId) || null;
  }

  async generateSmartPaste(userId: string, targetContext?: string): Promise<SmartPasteFormat[]> {
    const stagingArea = this.userStagingAreas.get(userId);
    if (!stagingArea || stagingArea.items.length === 0) {
      return [];
    }

    const formats: SmartPasteFormat[] = [];

    try {
      switch (stagingArea.targetFormat) {
        case 'contact':
          formats.push(...this.generateContactFormats(stagingArea.items));
          break;
        case 'email':
          formats.push(...this.generateEmailFormats(stagingArea.items));
          break;
        case 'document':
          formats.push(...this.generateDocumentFormats(stagingArea.items));
          break;
        default:
          formats.push(...this.generateGenericFormats(stagingArea.items));
      }

      // Sort by confidence
      return formats.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      logger.error('Error generating smart paste formats:', error);
      return [];
    }
  }

  private detectTargetFormat(item: ClipboardItem): StagingArea['targetFormat'] {
    const content = item.content.toLowerCase();
    const entities = item.entities || [];

    // Check for contact information
    const hasEmail = entities.some(e => e.type === 'email');
    const hasPhone = entities.some(e => e.type === 'phone');
    const hasPerson = entities.some(e => e.type === 'person');

    if ((hasEmail || hasPhone) && hasPerson) {
      return 'contact';
    }

    // Check for email-like content
    if (content.includes('subject:') || content.includes('dear') || content.includes('regards')) {
      return 'email';
    }

    // Check for document content
    if (content.length > 200 || content.includes('\n\n')) {
      return 'document';
    }

    return 'custom';
  }

  private generateContactFormats(items: ClipboardItem[]): SmartPasteFormat[] {
    const formats: SmartPasteFormat[] = [];
    
    // Extract contact information
    const contactData = this.extractContactData(items);
    
    if (Object.keys(contactData).length > 0) {
      // vCard format
      const vcard = this.generateVCard(contactData);
      formats.push({
        format: 'plain',
        content: vcard,
        confidence: 0.9
      });

      // JSON format
      formats.push({
        format: 'plain',
        content: JSON.stringify(contactData, null, 2),
        confidence: 0.7
      });

      // Human readable format
      const readable = this.generateReadableContact(contactData);
      formats.push({
        format: 'plain',
        content: readable,
        confidence: 0.8
      });
    }

    return formats;
  }

  private generateEmailFormats(items: ClipboardItem[]): SmartPasteFormat[] {
    const formats: SmartPasteFormat[] = [];
    
    // Combine items into email structure
    const emailContent = this.combineForEmail(items);
    
    // Plain text email
    formats.push({
      format: 'plain',
      content: emailContent.plain,
      confidence: 0.85
    });

    // HTML email
    formats.push({
      format: 'html',
      content: emailContent.html,
      confidence: 0.8
    });

    // Markdown email
    formats.push({
      format: 'markdown',
      content: emailContent.markdown,
      confidence: 0.75
    });

    return formats;
  }

  private generateDocumentFormats(items: ClipboardItem[]): SmartPasteFormat[] {
    const formats: SmartPasteFormat[] = [];
    
    // Combine items with proper formatting
    const combined = items.map(item => item.content).join('\n\n');
    
    // Plain text
    formats.push({
      format: 'plain',
      content: combined,
      confidence: 0.9
    });

    // Markdown with headers
    const markdown = items.map((item, index) => 
      `## Item ${index + 1}\n\n${item.content}`
    ).join('\n\n');
    
    formats.push({
      format: 'markdown',
      content: markdown,
      confidence: 0.8
    });

    // Rich text with formatting
    const richText = items.map((item, index) => 
      `<h3>Item ${index + 1}</h3><p>${item.content.replace(/\n/g, '<br>')}</p>`
    ).join('\n');
    
    formats.push({
      format: 'html',
      content: richText,
      confidence: 0.7
    });

    return formats;
  }

  private generateGenericFormats(items: ClipboardItem[]): SmartPasteFormat[] {
    const formats: SmartPasteFormat[] = [];
    
    // Simple concatenation
    const simple = items.map(item => item.content).join(' ');
    formats.push({
      format: 'plain',
      content: simple,
      confidence: 0.6
    });

    // Line-separated
    const lines = items.map(item => item.content).join('\n');
    formats.push({
      format: 'plain',
      content: lines,
      confidence: 0.7
    });

    // Comma-separated (for lists)
    const csv = items.map(item => item.content.replace(/,/g, '')).join(', ');
    formats.push({
      format: 'plain',
      content: csv,
      confidence: 0.5
    });

    return formats;
  }

  private extractContactData(items: ClipboardItem[]): Record<string, string> {
    const contactData: Record<string, string> = {};
    
    items.forEach(item => {
      const entities = item.entities || [];
      
      entities.forEach(entity => {
        switch (entity.type) {
          case 'email':
            contactData.email = entity.value;
            break;
          case 'phone':
            contactData.phone = entity.value;
            break;
          case 'person':
            contactData.name = entity.value;
            break;
          case 'address':
            contactData.address = entity.value;
            break;
          case 'organization':
            contactData.company = entity.value;
            break;
        }
      });

      // Also check raw content for patterns
      const content = item.content;
      if (!contactData.email && /@/.test(content)) {
        const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) contactData.email = emailMatch[0];
      }
    });

    return contactData;
  }

  private generateVCard(contactData: Record<string, string>): string {
    let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
    
    if (contactData.name) {
      vcard += `FN:${contactData.name}\n`;
    }
    if (contactData.email) {
      vcard += `EMAIL:${contactData.email}\n`;
    }
    if (contactData.phone) {
      vcard += `TEL:${contactData.phone}\n`;
    }
    if (contactData.company) {
      vcard += `ORG:${contactData.company}\n`;
    }
    if (contactData.address) {
      vcard += `ADR:;;${contactData.address};;;;\n`;
    }
    
    vcard += 'END:VCARD';
    return vcard;
  }

  private generateReadableContact(contactData: Record<string, string>): string {
    const lines: string[] = [];
    
    if (contactData.name) lines.push(`Name: ${contactData.name}`);
    if (contactData.email) lines.push(`Email: ${contactData.email}`);
    if (contactData.phone) lines.push(`Phone: ${contactData.phone}`);
    if (contactData.company) lines.push(`Company: ${contactData.company}`);
    if (contactData.address) lines.push(`Address: ${contactData.address}`);
    
    return lines.join('\n');
  }

  private combineForEmail(items: ClipboardItem[]): { plain: string; html: string; markdown: string } {
    const subject = items.find(item => 
      item.content.toLowerCase().includes('subject') || 
      item.content.length < 50
    )?.content || 'Combined Content';

    const body = items.filter(item => item.content !== subject)
      .map(item => item.content)
      .join('\n\n');

    return {
      plain: `Subject: ${subject}\n\n${body}`,
      html: `<strong>Subject:</strong> ${subject}<br><br>${body.replace(/\n/g, '<br>')}`,
      markdown: `**Subject:** ${subject}\n\n${body}`
    };
  }

  async clearStaging(userId: string): Promise<void> {
    this.userStagingAreas.delete(userId);
  }

  async getAllStagingAreas(): Promise<StagingArea[]> {
    return Array.from(this.userStagingAreas.values());
  }
}

export const stagingService = new StagingService();