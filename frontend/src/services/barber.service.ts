import { api } from './api';
import { Barber, BarberStatus } from '../types';

export interface CreateBarberPayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
  specialization?: string;
  sortOrder?: number;
}

export const barberService = {
  async getAll(includeInactive: boolean = false): Promise<Barber[]> {
    const response = await api.get('/barbers', {
      params: { includeInactive: includeInactive ? 'true' : undefined },
    });
    return response.data.data;
  },

  async getById(id: string): Promise<Barber> {
    const response = await api.get(`/barbers/${id}`);
    return response.data.data;
  },

  async create(payload: CreateBarberPayload): Promise<Barber> {
    const response = await api.post('/barbers', payload);
    return response.data.data;
  },

  async update(id: string, payload: Partial<CreateBarberPayload>): Promise<Barber> {
    const response = await api.put(`/barbers/${id}`, payload);
    return response.data.data;
  },

  async updateStatus(id: string, status: BarberStatus): Promise<Barber> {
    const response = await api.patch(`/barbers/${id}/status`, { status });
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/barbers/${id}`);
  },
};
