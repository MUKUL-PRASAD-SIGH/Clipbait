import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ClipboardItem, User } from '../types';

// API Configuration
const getApiUrl = () => {
  if (typeof window !== 'undefined' && (window as any).__TAURI__) {
    return (window as any).VITE_API_URL || 'http://localhost:3000/api';
  }
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiUrl();
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Base delay in milliseconds

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class NetworkError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Retry Logic with Exponential Backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetry = (error: AxiosError): boolean => {
  if (!error.response) return true; // Network error
  const status = error.response.status;
  return status >= 500 || status === 429; // Server errors or rate limiting
};

const retryRequest = async (
  requestFn: () => Promise<AxiosResponse>,
  retries: number = MAX_RETRIES
): Promise<AxiosResponse> => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && shouldRetry(error as AxiosError)) {
      const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1); // Exponential backoff
      await sleep(delay);
      return retryRequest(requestFn, retries - 1);
    }
    throw error;
  }
};

// Enhanced Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    (config as any).metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor with Enhanced Error Handling
api.interceptors.response.use(
  (response) => {
    // Log response time for debugging
    const endTime = new Date();
    const startTime = (response.config as any).metadata?.startTime;
    if (startTime) {
      const duration = endTime.getTime() - startTime.getTime();
      console.debug(`API Request to ${response.config.url} took ${duration}ms`);
    }
    
    return response;
  },
  (error: AxiosError) => {
    const errorMessage = getErrorMessage(error);
    
    // Handle different error types
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      throw new AuthenticationError(errorMessage);
    }
    
    if (error.response?.status === 400) {
      throw new ValidationError(errorMessage, error.response.data);
    }
    
    if (!error.response) {
      throw new NetworkError('Network connection failed. Please check your internet connection.');
    }
    
    throw new NetworkError(errorMessage, error.response.status, error.code);
  }
);

// Error Message Extraction
const getErrorMessage = (error: AxiosError): string => {
  if (error.response?.data) {
    const data = error.response.data as any;
    return data.message || data.error || 'An unexpected error occurred';
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Enhanced API Request Wrapper
const makeRequest = async <T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    const response = await retryRequest(requestFn);
    return response.data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    return makeRequest(() => api.post('/auth/login', { email, password }));
  },

  register: async (email: string, password: string) => {
    return makeRequest(() => api.post('/auth/register', { email, password }));
  },

  getCurrentUser: async (): Promise<User> => {
    return makeRequest(() => api.get('/auth/me'));
  },

  refreshToken: async (): Promise<{ token: string }> => {
    return makeRequest(() => api.post('/auth/refresh'));
  },

  logout: async (): Promise<void> => {
    try {
      await makeRequest(() => api.post('/auth/logout'));
    } finally {
      localStorage.removeItem('auth_token');
    }
  },
};

// Clipboard API
export const clipboardApi = {
  getHistory: async (limit?: number, offset?: number): Promise<ClipboardItem[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return makeRequest(() => api.get(`/clipboard/history?${params.toString()}`));
  },

  addItem: async (content: string, contentType: string = 'text'): Promise<ClipboardItem> => {
    return makeRequest(() => api.post('/clipboard/add', { 
      content,
      contentType,
      deviceId: 'desktop-app',
      timestamp: new Date().toISOString()
    }));
  },

  deleteItem: async (id: string): Promise<void> => {
    console.log('API: Attempting to delete item with id:', id);
    try {
      const result = await makeRequest(() => api.delete(`/clipboard/${id}`));
      console.log('API: Delete successful');
      return result;
    } catch (error) {
      console.error('API: Delete failed:', error);
      throw error;
    }
  },

  clearHistory: async (): Promise<void> => {
    return makeRequest(() => api.delete('/clipboard/history'));
  },

  executeSuggestion: async (suggestionId: string, itemId?: string): Promise<void> => {
    return makeRequest(() => api.post(`/clipboard/execute-suggestion/${suggestionId}`, {
      itemId
    }));
  },

  search: async (query: string, filters?: { contentType?: string; dateRange?: string }): Promise<ClipboardItem[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters?.contentType) {
      params.append('contentType', filters.contentType);
    }
    if (filters?.dateRange) {
      params.append('dateRange', filters.dateRange);
    }
    
    return makeRequest(() => api.get(`/clipboard/search?${params.toString()}`));
  },

  getItemById: async (id: string): Promise<ClipboardItem> => {
    return makeRequest(() => api.get(`/clipboard/${id}`));
  },

  updateItem: async (id: string, updates: Partial<ClipboardItem>): Promise<ClipboardItem> => {
    return makeRequest(() => api.patch(`/clipboard/${id}`, updates));
  },

  pinItem: async (id: string): Promise<void> => {
    return makeRequest(() => api.post(`/clipboard/${id}/pin`));
  },

  unpinItem: async (id: string): Promise<void> => {
    return makeRequest(() => api.post(`/clipboard/${id}/unpin`));
  },
};

// AI Processing API with Fallback Support
export const aiApi = {
  processContent: async (content: string, contentType: string = 'text') => {
    try {
      // Create a separate axios instance for AI requests (MVP - no auth)
      const aiRequest = axios.create({
        baseURL: API_BASE_URL,
        timeout: 15000, // Longer timeout for AI processing
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await retryRequest(() => 
        aiRequest.post('/ai/process', {
          content,
          contentType,
          timestamp: new Date().toISOString()
        })
      );

      return response.data.data || response.data;
    } catch (error) {
      console.warn('AI processing failed, using fallback:', error);
      
      // Fallback: Generate basic suggestions based on content analysis
      return generateFallbackSuggestions(content, contentType);
    }
  },

  getSuggestions: async (content: string) => {
    try {
      const aiRequest = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await retryRequest(() => 
        aiRequest.post('/ai/suggestions', {
          content,
          timestamp: new Date().toISOString()
        })
      );

      return response.data;
    } catch (error) {
      console.warn('AI suggestions failed, using fallback:', error);
      
      // Fallback: Generate basic suggestions
      const fallback = generateFallbackSuggestions(content);
      return {
        success: true,
        suggestions: fallback.suggestions,
        confidence: fallback.confidence
      };
    }
  },

  // Health check for AI service
  checkHealth: async (): Promise<{ status: string; latency?: number }> => {
    try {
      const startTime = Date.now();
      await axios.get(`${API_BASE_URL}/ai/health`, { timeout: 5000 });
      const latency = Date.now() - startTime;
      
      return { status: 'healthy', latency };
    } catch (error) {
      return { status: 'unhealthy' };
    }
  },
};

// Fallback AI Processing
const generateFallbackSuggestions = (content: string, contentType: string = 'text') => {
  const suggestions = [];
  const entities = [];

  // Basic pattern matching for common entities
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

  // Extract emails
  const emails = content.match(emailRegex);
  if (emails) {
    emails.forEach(email => {
      entities.push({ type: 'email', value: email, confidence: 0.9 });
      suggestions.push({
        id: `email-${email}`,
        type: 'send_email',
        title: 'Send Email',
        description: `Send email to ${email}`,
        icon: '📧',
        confidence: 0.8,
        metadata: { email }
      });
    });
  }

  // Extract phone numbers
  const phones = content.match(phoneRegex);
  if (phones) {
    phones.forEach(phone => {
      entities.push({ type: 'phone', value: phone, confidence: 0.8 });
      suggestions.push({
        id: `phone-${phone}`,
        type: 'call_phone',
        title: 'Call Number',
        description: `Call ${phone}`,
        icon: '📞',
        confidence: 0.7,
        metadata: { phone }
      });
    });
  }

  // Extract URLs
  const urls = content.match(urlRegex);
  if (urls) {
    urls.forEach(url => {
      entities.push({ type: 'url', value: url, confidence: 0.95 });
      suggestions.push({
        id: `url-${url}`,
        type: 'open_url',
        title: 'Open Link',
        description: `Open ${url}`,
        icon: '🔗',
        confidence: 0.9,
        metadata: { url }
      });
    });
  }

  // Always add copy suggestion
  suggestions.push({
    id: 'copy-content',
    type: 'copy',
    title: 'Copy to Clipboard',
    description: 'Copy this content to clipboard',
    icon: '📋',
    confidence: 1.0
  });

  return {
    entities,
    suggestions,
    category: contentType,
    confidence: 0.7,
    fallback: true
  };
};

// Utility Functions
export const apiUtils = {
  // Check if user is online
  isOnline: (): boolean => {
    return navigator.onLine;
  },

  // Get error message from various error types
  getErrorMessage: (error: unknown): string => {
    if (error instanceof NetworkError || error instanceof ValidationError || error instanceof AuthenticationError) {
      return error.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  },

  // Format API response for consistent handling
  formatResponse: <T>(data: T, message?: string) => ({
    success: true,
    data,
    message: message || 'Request successful'
  }),

  // Create abort controller for request cancellation
  createAbortController: (): AbortController => {
    return new AbortController();
  },

  // Validate network connectivity
  checkConnectivity: async (): Promise<boolean> => {
    try {
      await fetch(`${API_BASE_URL}/health`, { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch {
      return false;
    }
  }
};

// Enhanced API Service with Error Handling
export const apiService = {
  // Authentication
  auth: authApi,
  
  // Clipboard operations
  clipboard: clipboardApi,
  
  // AI processing
  ai: aiApi,
  
  // Utilities
  utils: apiUtils,
  
  // Error types for consumers
  errors: {
    NetworkError,
    ValidationError,
    AuthenticationError
  }
};

// Named export for the api instance
export { api };

// Default export for backward compatibility
export default apiService;