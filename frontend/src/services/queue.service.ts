import { api } from './api';
import { QueueEntry, JoinQueuePayload, SalonSettings, Barber } from '../types';

export interface TVDisplayData {
  barbers: (Barber & { queueEntries: QueueEntry[] })[];
  waitingQueue: QueueEntry[];
  calledCustomers: QueueEntry[];
  settings: SalonSettings;
  timestamp: string;
}

export const queueService = {
  async joinQueue(payload: JoinQueuePayload): Promise<QueueEntry> {
    const response = await api.post('/queue/join', payload);
    return response.data.data;
  },

  async getLiveQueue(): Promise<QueueEntry[]> {
    const response = await api.get('/queue');
    return response.data.data;
  },

  async getEntryById(id: string): Promise<QueueEntry> {
    const response = await api.get(`/queue/entry/${id}`);
    return response.data.data;
  },

  async getCustomerActiveEntry(phone?: string): Promise<QueueEntry | null> {
    const response = await api.get('/queue/my-position', {
      params: { phone },
    });
    return response.data.data;
  },

  async getCustomerHistory(phone?: string): Promise<QueueEntry[]> {
    const response = await api.get('/queue/history', {
      params: { phone },
    });
    return response.data.data;
  },

  async callNext(entryId?: string, barberId?: string): Promise<QueueEntry> {
    const endpoint = entryId ? `/queue/${entryId}/call` : '/queue/call-next';
    const response = await api.patch(endpoint, { barberId });
    return response.data.data;
  },

  async startService(entryId: string, barberId?: string): Promise<QueueEntry> {
    const response = await api.patch(`/queue/${entryId}/start`, { barberId });
    return response.data.data;
  },

  async completeService(entryId: string): Promise<QueueEntry> {
    const response = await api.patch(`/queue/${entryId}/complete`);
    return response.data.data;
  },

  async cancelQueue(entryId: string): Promise<QueueEntry> {
    const response = await api.patch(`/queue/${entryId}/cancel`);
    return response.data.data;
  },

  async markNoShow(entryId: string): Promise<QueueEntry> {
    const response = await api.patch(`/queue/${entryId}/no-show`);
    return response.data.data;
  },

  async skipCustomer(entryId: string): Promise<QueueEntry> {
    const response = await api.patch(`/queue/${entryId}/skip`);
    return response.data.data;
  },

  async assignBarber(entryId: string, barberId: string): Promise<QueueEntry> {
    const response = await api.patch(`/queue/${entryId}/assign`, { barberId });
    return response.data.data;
  },

  async getTVData(): Promise<TVDisplayData> {
    const response = await api.get('/queue/tv');
    return response.data.data;
  },
};
