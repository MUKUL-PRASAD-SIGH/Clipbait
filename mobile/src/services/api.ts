import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClipboardItem, ActionSuggestion } from '../types';

const API_BASE_URL = 'http://localhost:3001/api'; // Your backend URL

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth API
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name?: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async verifyToken(token: string) {
    return this.request<any>('/auth/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async logout() {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // Clipboard API
  async getHistory(page = 1, limit = 50): Promise<ClipboardItem[]> {
    const response = await this.request<{ success: boolean; data: ClipboardItem[] }>(
      `/clipboard?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async addItem(content: string): Promise<ClipboardItem> {
    const response = await this.request<{ success: boolean; data: ClipboardItem }>(
      '/clipboard',
      {
        method: 'POST',
        body: JSON.stringify({ content, contentType: 'text' }),
      }
    );
    return response.data;
  }

  async deleteItem(id: string): Promise<void> {
    await this.request<void>(`/clipboard/${id}`, {
      method: 'DELETE',
    });
  }

  async executeSuggestion(suggestionId: string): Promise<void> {
    await this.request<void>('/ai/execute', {
      method: 'POST',
      body: JSON.stringify({ suggestionId }),
    });
  }

  // AI API
  async processContent(content: string): Promise<{ entities: any[]; suggestions: ActionSuggestion[] }> {
    const response = await this.request<{ success: boolean; data: any }>('/ai/process', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return response.data;
  }

  async getSuggestions(content: string): Promise<ActionSuggestion[]> {
    const response = await this.request<{ success: boolean; suggestions: ActionSuggestion[] }>(
      '/ai/suggestions',
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    );
    return response.suggestions;
  }
}

export const authApi = new ApiClient();
export const clipboardApi = new ApiClient();