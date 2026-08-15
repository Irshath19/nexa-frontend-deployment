import axios, { type AxiosError, type AxiosResponse } from 'axios';
import type { ApiError } from '@/types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — inject auth token ───────────────────
api.interceptors.request.use((config) => {
  // Token is in httpOnly cookie — no manual injection needed
  // But if using localStorage fallback in dev:
  const token = localStorage.getItem('nexa_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401s ───────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status;

    if (status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('nexa_access_token');
      localStorage.removeItem('nexa_auth');
      window.location.href = '/login';
    }

    // Normalize error message
    const apiError = error.response?.data?.error;
    const message = apiError?.message || error.message || 'Something went wrong';
    const code = apiError?.code || 'UNKNOWN_ERROR';

    return Promise.reject({ code, message, status });
  }
);

export default api;

// ── Typed error helper ────────────────────────────────────────
export interface NexaApiError {
  code: string;
  message: string;
  status?: number;
}

export function isNexaError(e: unknown): e is NexaApiError {
  return typeof e === 'object' && e !== null && 'code' in e && 'message' in e;
}
