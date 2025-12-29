'use client';

import { apiClient, type User } from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const data = await apiClient.login({ email, password });
    return data.user;
  },

  async register(email: string, password: string, name: string): Promise<User> {
    const data = await apiClient.register({ email, password, name });
    return data.user;
  },

  logout(): void {
    apiClient.logout();
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const user = window.localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async getAuthSession(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      return await apiClient.getMe();
    } catch {
      // Token invalid, clear it
      apiClient.logout();
      return null;
    }
  },
};
