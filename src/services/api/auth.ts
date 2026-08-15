import api from './client';
import type { User, AuthTokens, ApiResponse } from '@/types';

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    const { data } = await api.post('/auth/login', payload);
    if (data.data?.tokens?.accessToken) {
      localStorage.setItem('nexa_access_token', data.data.tokens.accessToken);
    }
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('nexa_access_token');
  },

  me: async (): Promise<ApiResponse<User>> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
