import { api } from './api';
import { SalonSettings } from '../types';

export const settingsService = {
  async getSettings(): Promise<SalonSettings> {
    const response = await api.get('/settings');
    return response.data.data;
  },

  async updateSettings(payload: Partial<SalonSettings>): Promise<SalonSettings> {
    const response = await api.put('/settings', payload);
    return response.data.data;
  },

  async toggleQueue(isOpen: boolean): Promise<SalonSettings> {
    const response = await api.patch('/settings/toggle-queue', { isOpen });
    return response.data.data;
  },
};
