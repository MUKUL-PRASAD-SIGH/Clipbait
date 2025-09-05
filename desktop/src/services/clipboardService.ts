import { invoke } from '@tauri-apps/api/tauri';

export class ClipboardService {
  static async getCurrentClipboard(): Promise<string> {
    try {
      return await invoke('get_clipboard_text');
    } catch (error) {
      console.error('Failed to get clipboard text:', error);
      throw error;
    }
  }

  static async setClipboard(text: string): Promise<void> {
    try {
      await invoke('set_clipboard_text', { text });
    } catch (error) {
      console.error('Failed to set clipboard text:', error);
      throw error;
    }
  }

  static async showNotification(title: string, body: string): Promise<void> {
    try {
      await invoke('show_notification', { title, body });
    } catch (error) {
      console.error('Failed to show notification:', error);
      throw error;
    }
  }
}

export default ClipboardService;