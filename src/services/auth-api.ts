import { apiRequest } from './api';

type AuthResponse = { token: string; user: { id: number; name: string; email: string } };

export const authApi = {
  login: (email: string, password: string) => apiRequest<AuthResponse>('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string) => apiRequest<AuthResponse>('/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  logout: (token: string) => apiRequest<void>('/logout', { method: 'POST', token }),
};
