import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export interface CreateServiceInput {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  category?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {}

export class ServiceService {
  async getAllServices(includeInactive: boolean = false) {
    return prisma.service.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getServiceById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    });
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    return service;
  }

  async createService(input: CreateServiceInput) {
    return prisma.service.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim(),
        durationMinutes: input.durationMinutes,
        price: input.price,
        category: input.category?.trim() || 'General',
        isActive: input.isActive ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  async updateService(id: string, input: UpdateServiceInput) {
    await this.getServiceById(id);
    return prisma.service.update({
      where: { id },
      data: input,
    });
  }

  async deleteService(id: string) {
    await this.getServiceById(id);
    // Soft delete to protect historical queue records
    return prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const serviceService = new ServiceService();
