import api from './client';
import type { EmailAccount, ApiResponse, EmailProvider } from '@/types';
import { API_BASE_URL } from '@/constants';

export const emailAccountsApi = {
  list: async (): Promise<ApiResponse<EmailAccount[]>> => {
    const { data } = await api.get('/email-accounts');
    return data;
  },

  connectGmail: (): void => {
    const token = localStorage.getItem('nexa_access_token');
    window.location.href = `${API_BASE_URL}/email-accounts/gmail/connect${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  connectDemo: async (): Promise<ApiResponse<EmailAccount>> => {
    const { data } = await api.post('/email-accounts/demo');
    return data;
  },

  connect: (provider: EmailProvider = 'gmail'): void => {
    emailAccountsApi.connectGmail();
  },

  disconnect: async (accountId: string): Promise<void> => {
    await api.delete(`/email-accounts/${accountId}`);
  },
};
