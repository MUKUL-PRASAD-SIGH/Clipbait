import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClipboardItem, User } from '../types';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      // Navigate to login screen - this would need to be handled by navigation
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
};

export const clipboardApi = {
  getHistory: async (): Promise<ClipboardItem[]> => {
    const response = await api.get('/clipboard/history');
    return response.data.data;
  },

  addItem: async (content: string): Promise<ClipboardItem> => {
    const response = await api.post('/clipboard/add', { 
      content,
      contentType: 'text',
      deviceId: 'mobile-app'
    });
    return response.data.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/clipboard/${id}`);
  },

  executeSuggestion: async (suggestionId: string): Promise<void> => {
    await api.post(`/clipboard/execute-suggestion/${suggestionId}`);
  },

  search: async (query: string): Promise<ClipboardItem[]> => {
    const response = await api.get(`/clipboard/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },
};