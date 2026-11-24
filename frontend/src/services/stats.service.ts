import { api } from './api';
import { DailyStats, BarberStats, ServiceStats } from '../types';

export const statsService = {
  async getDaily(): Promise<DailyStats & { totalToday: number }> {
    const response = await api.get('/stats/daily');
    return response.data.data;
  },

  async getBarberStats(): Promise<BarberStats[]> {
    const response = await api.get('/stats/barbers');
    return response.data.data;
  },

  async getPopularServices(): Promise<ServiceStats[]> {
    const response = await api.get('/stats/services');
    return response.data.data;
  },
};
