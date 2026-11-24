import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { BarberStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface CreateBarberInput {
  name: string;
  email: string;
  phone: string;
  password?: string;
  specialization?: string;
  sortOrder?: number;
}

export interface UpdateBarberInput {
  name?: string;
  specialization?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export class BarberService {
  async getAllBarbers(includeInactive: boolean = false) {
    return prisma.barber.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getBarberById(id: string) {
    const barber = await prisma.barber.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
    if (!barber) {
      throw new NotFoundError('Barber not found');
    }
    return barber;
  }

  async createBarber(input: CreateBarberInput) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });
    if (existingEmail) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password || 'password123', 10);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name.trim(),
          email: input.email.toLowerCase().trim(),
          phone: input.phone.trim(),
          password: hashedPassword,
          role: Role.BARBER,
        },
      });

      const barber = await tx.barber.create({
        data: {
          userId: user.id,
          name: input.name.trim(),
          specialization: input.specialization?.trim(),
          status: BarberStatus.AVAILABLE,
          sortOrder: input.sortOrder ?? 0,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },
        },
      });

      return barber;
    });
  }

  async updateBarber(id: string, input: UpdateBarberInput) {
    const barber = await this.getBarberById(id);

    return prisma.$transaction(async (tx) => {
      if (input.name) {
        await tx.user.update({
          where: { id: barber.userId },
          data: { name: input.name.trim() },
        });
      }

      return tx.barber.update({
        where: { id },
        data: {
          name: input.name?.trim(),
          specialization: input.specialization?.trim(),
          sortOrder: input.sortOrder,
          isActive: input.isActive,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },
        },
      });
    });
  }

  async updateStatus(id: string, status: BarberStatus) {
    await this.getBarberById(id);
    return prisma.barber.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  async deleteBarber(id: string) {
    await this.getBarberById(id);
    // Soft delete
    return prisma.barber.update({
      where: { id },
      data: { isActive: false, status: BarberStatus.OFFLINE },
    });
  }
}

export const barberService = new BarberService();
