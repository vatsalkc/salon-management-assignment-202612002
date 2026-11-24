import { api } from './api';
import { Service } from '../types';

export interface CreateServicePayload {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  category?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const serviceService = {
  async getAll(includeInactive: boolean = false): Promise<Service[]> {
    const response = await api.get('/services', {
      params: { includeInactive: includeInactive ? 'true' : undefined },
    });
    return response.data.data;
  },

  async getById(id: string): Promise<Service> {
    const response = await api.get(`/services/${id}`);
    return response.data.data;
  },

  async create(payload: CreateServicePayload): Promise<Service> {
    const response = await api.post('/services', payload);
    return response.data.data;
  },

  async update(id: string, payload: Partial<CreateServicePayload>): Promise<Service> {
    const response = await api.put(`/services/${id}`, payload);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },
};
