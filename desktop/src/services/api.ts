import axios from 'axios';
import { ClipboardItem, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.reload();
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
      deviceId: 'desktop-app'
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