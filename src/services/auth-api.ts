import { apiRequest } from './api';

export type Role = 'reader' | 'admin';
export type ApiReaderPreferences = { font_size?: number; line_height?: number; theme?: 'light' | 'sepia' | 'dark'; speed?: number };
export type AuthUser = { id: number; name: string; email: string; role: Role; avatar_url: string | null; preferences: ApiReaderPreferences };
export type AuthResponse = { token: string; user: AuthUser };

export const authApi = {
  login: (email: string, password: string) => apiRequest<AuthResponse>('/login', { method: 'POST', token: null, body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string, confirmation: string) => apiRequest<AuthResponse>('/register', { method: 'POST', token: null, body: JSON.stringify({ name, email, password, password_confirmation: confirmation }) }),
  me: (token: string) => apiRequest<{ user: AuthUser }>('/me', { token }),
  logout: (token: string) => apiRequest<void>('/logout', { method: 'POST', token }),
};
