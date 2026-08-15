import api from './client';
import type { DashboardOverview, ApiResponse } from '@/types';

export const dashboardApi = {
  overview: async (
    accountId: string | null,
    date: string
  ): Promise<ApiResponse<DashboardOverview>> => {
    const { data } = await api.get('/dashboard/overview', {
      params: {
        account_id: accountId ?? undefined,
        date,
      },
    });
    return data;
  },
};
