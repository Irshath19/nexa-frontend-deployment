import api from './client';
import type { Email, EmailStats, ApiResponse, EmailListParams } from '@/types';

export interface DraftReplyResult {
  draft: string;
  subject: string;
  recipient: string;
  recipientName: string;
}

export interface SendReplyPayload {
  body: string;
  subject?: string;
  recipient?: string;
}

export interface TaskItem {
  title: string;
  description?: string | null;
  due?: string | null;
  priority: 'High' | 'Medium' | 'Low' | string;
  sourceEmail?: string | null;
  completed?: boolean;
}

export interface CalendarEventDetails {
  id?: string | null;
  title: string;
  date: string;
  time: string;
  duration?: string | null;
  mode?: string | null;
  meetingUrl?: string | null;
  location?: string | null;
  description?: string | null;
  htmlLink?: string | null;
}

export interface ExplainEmailResult {
  summary: string;
  importantDetails?: string[];
  actionsRequired?: string[];
  explanation: string;
  category?: string;
  keyTakeaways?: string[];
}

export const emailsApi = {
  list: async (params: EmailListParams): Promise<ApiResponse<Email[]>> => {
    const { data } = await api.get('/emails', { params });
    return data;
  },

  get: async (emailId: string): Promise<ApiResponse<Email>> => {
    const { data } = await api.get(`/emails/${emailId}`);
    return data;
  },

  statistics: async (accountId: string, date: string): Promise<ApiResponse<EmailStats>> => {
    const { data } = await api.get('/emails/statistics', {
      params: { account_id: accountId, date },
    });
    return data;
  },

  search: async (
    accountId: string,
    q: string,
    date?: string
  ): Promise<ApiResponse<Email[]>> => {
    const { data } = await api.get('/emails/search', {
      params: { account_id: accountId, q, date },
    });
    return data;
  },

  markRead: async (emailId: string): Promise<void> => {
    await api.patch(`/emails/${emailId}/read`);
  },

  markUnread: async (emailId: string): Promise<void> => {
    await api.patch(`/emails/${emailId}/unread`);
  },

  markImportant: async (emailId: string, important: boolean): Promise<void> => {
    await api.patch(`/emails/${emailId}/important`, { important });
  },

  draftReply: async (
    emailId: string,
    instructions?: string,
    modelId?: string
  ): Promise<ApiResponse<DraftReplyResult>> => {
    const { data } = await api.post(`/emails/${emailId}/draft-reply`, {
      instructions,
      model_id: modelId,
    });
    return data;
  },

  sendReply: async (
    emailId: string,
    payload: SendReplyPayload
  ): Promise<ApiResponse<{ id: string; threadId?: string; status: string; message: string }>> => {
    const { data } = await api.post(`/emails/${emailId}/reply`, payload);
    return data;
  },

  extractTasks: async (
    emailId: string,
    modelId?: string
  ): Promise<ApiResponse<{ tasks: TaskItem[] }>> => {
    const { data } = await api.post(`/emails/${emailId}/extract-tasks`, null, {
      params: { model_id: modelId },
    });
    return data;
  },

  getCalendarDetails: async (
    emailId: string,
    modelId?: string
  ): Promise<ApiResponse<CalendarEventDetails | null>> => {
    const { data } = await api.post(`/emails/${emailId}/calendar-details`, null, {
      params: { model_id: modelId },
    });
    return data;
  },

  createCalendarEvent: async (
    emailId: string,
    payload?: Partial<CalendarEventDetails>,
    modelId?: string
  ): Promise<ApiResponse<CalendarEventDetails>> => {
    const { data } = await api.post(`/emails/${emailId}/calendar-event`, payload, {
      params: { model_id: modelId },
    });
    return data;
  },

  explainEmail: async (
    emailId: string,
    modelId?: string
  ): Promise<ApiResponse<ExplainEmailResult>> => {
    const { data } = await api.post(`/emails/${emailId}/explain`, null, {
      params: { model_id: modelId },
    });
    return data;
  },

  analyzeEmail: async (
    emailId: string,
    modelId?: string
  ): Promise<ApiResponse<Email>> => {
    const { data } = await api.post(`/emails/${emailId}/analyze`, null, {
      params: { model_id: modelId },
    });
    return data;
  },
};
