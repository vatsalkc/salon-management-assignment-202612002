import { prisma } from '../config/database';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { QueueStatus, BarberStatus } from '@prisma/client';
import { settingsService } from './settings.service';

export interface JoinQueueInput {
  customerName: string;
  customerPhone: string;
  customerId?: string;
  serviceIds: string[];
  barberId?: string; // Optional: specific preferred barber or undefined for Any Barber
  notes?: string;
}

export class QueueService {
  /**
   * Generates next daily token e.g., A001, A002...
   */
  private async generateTokenNumber(): Promise<string> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const countToday = await prisma.queueEntry.count({
      where: {
        joinedAt: {
          gte: today,
        },
      },
    });

    const tokenIndex = countToday + 1;
    const formattedNum = String(tokenIndex).padStart(3, '0');
    return `A${formattedNum}`;
  }

  /**
   * Recalculates and updates positions for all currently waiting entries
   */
  async recalculatePositions(): Promise<void> {
    const waitingEntries = await prisma.queueEntry.findMany({
      where: { status: QueueStatus.WAITING },
      orderBy: { joinedAt: 'asc' },
      include: {
        services: {
          include: { service: true },
        },
      },
    });

    let cumulativeWaitMinutes = 0;

    for (let i = 0; i < waitingEntries.length; i++) {
      const entry = waitingEntries[i];
      const position = i + 1;

      // Estimated wait time based on services of customers ahead
      await prisma.queueEntry.update({
        where: { id: entry.id },
        data: {
          position,
          estimatedWaitMinutes: cumulativeWaitMinutes,
        },
      });

      // Add this entry's duration for subsequent customers
      const entryDuration = entry.services.reduce(
        (sum, s) => sum + (s.service?.durationMinutes || 20),
        0
      );
      // Average across active barbers
      const activeBarbersCount = Math.max(
        1,
        await prisma.barber.count({
          where: { isActive: true, status: { not: BarberStatus.OFFLINE } },
        })
      );
      cumulativeWaitMinutes += Math.ceil(entryDuration / activeBarbersCount);
    }
  }

  /**
   * Customer or Receptionist adds customer to the queue
   */
  async joinQueue(input: JoinQueueInput) {
    // 1. Verify Salon Settings
    const settings = await settingsService.getSettings();
    if (!settings.isQueueOpen) {
      throw new BadRequestError('Queue is currently closed by the salon management');
    }

    const currentWaitingCount = await prisma.queueEntry.count({
      where: { status: QueueStatus.WAITING },
    });
    if (currentWaitingCount >= settings.maxQueueSize) {
      throw new BadRequestError('Queue is at maximum capacity. Please check back shortly.');
    }

    // 2. Enforce One Active Queue per Phone Number rule
    const activeEntry = await prisma.queueEntry.findFirst({
      where: {
        customerPhone: input.customerPhone.trim(),
        status: { in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE] },
      },
    });
    if (activeEntry) {
      throw new ConflictError(
        `This phone number already has an active queue ticket (${activeEntry.tokenNumber})`
      );
    }

    // 3. Verify Services
    if (!input.serviceIds || input.serviceIds.length === 0) {
      throw new BadRequestError('At least one service must be selected');
    }
    const services = await prisma.service.findMany({
      where: { id: { in: input.serviceIds }, isActive: true },
    });
    if (services.length !== input.serviceIds.length) {
      throw new BadRequestError('One or more selected services are invalid or inactive');
    }

    // 4. Verify Barber if preferred barber specified
    let assignedBarberId: string | null = null;
    if (input.barberId) {
      const barber = await prisma.barber.findUnique({
        where: { id: input.barberId },
      });
      if (!barber || !barber.isActive) {
        throw new BadRequestError('Selected barber is not available');
      }
      assignedBarberId = barber.id;
    }

    // 5. Generate daily token and compute initial position
    const tokenNumber = await this.generateTokenNumber();
    const position = currentWaitingCount + 1;

    // Approximate wait time based on services ahead
    const totalMinutesAhead = currentWaitingCount * 20;

    const entry = await prisma.queueEntry.create({
      data: {
        tokenNumber,
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone.trim(),
        customerId: input.customerId,
        barberId: assignedBarberId,
        status: QueueStatus.WAITING,
        position,
        estimatedWaitMinutes: totalMinutesAhead,
        notes: input.notes?.trim(),
        services: {
          create: input.serviceIds.map((serviceId) => ({
            service: { connect: { id: serviceId } },
          })),
        },
      },
      include: {
        barber: true,
        services: {
          include: { service: true },
        },
      },
    });

    // Recompute accurate positions and wait times
    await this.recalculatePositions();

    return this.getQueueEntryById(entry.id);
  }

  /**
   * Get single queue entry with relations
   */
  async getQueueEntryById(id: string) {
    const entry = await prisma.queueEntry.findUnique({
      where: { id },
      include: {
        barber: true,
        services: {
          include: { service: true },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
    if (!entry) {
      throw new NotFoundError('Queue entry not found');
    }
    return entry;
  }

  /**
   * Get live queue entries (WAITING, CALLED, IN_SERVICE) for dashboard
   */
  async getLiveQueue() {
    return prisma.queueEntry.findMany({
      where: {
        status: { in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE] },
      },
      orderBy: [
        { status: 'asc' }, // CALLED first, IN_SERVICE, WAITING
        { position: 'asc' },
        { joinedAt: 'asc' },
      ],
      include: {
        barber: true,
        services: {
          include: { service: true },
        },
      },
    });
  }

  /**
   * Receptionist calls the next customer in line
   */
  async callNextCustomer(entryId?: string, barberId?: string) {
    let targetEntry;

    if (entryId) {
      targetEntry = await this.getQueueEntryById(entryId);
    } else {
      // FIFO: get earliest waiting customer
      targetEntry = await prisma.queueEntry.findFirst({
        where: { status: QueueStatus.WAITING },
        orderBy: { joinedAt: 'asc' },
        include: { barber: true, services: { include: { service: true } } },
      });
    }

    if (!targetEntry) {
      throw new NotFoundError('No waiting customers in queue');
    }

    const updated = await prisma.queueEntry.update({
      where: { id: targetEntry.id },
      data: {
        status: QueueStatus.CALLED,
        calledAt: new Date(),
        barberId: barberId || targetEntry.barberId,
      },
      include: {
        barber: true,
        services: { include: { service: true } },
      },
    });

    await this.recalculatePositions();
    return updated;
  }

  /**
   * Barber starts service
   */
  async startService(entryId: string, barberId?: string) {
    const entry = await this.getQueueEntryById(entryId);

    if (entry.status !== QueueStatus.CALLED && entry.status !== QueueStatus.WAITING) {
      throw new BadRequestError(`Cannot start service for entry with status: ${entry.status}`);
    }

    const effectiveBarberId = barberId || entry.barberId;
    if (!effectiveBarberId) {
      throw new BadRequestError('A barber must be assigned to start service');
    }

    // Set barber status to BUSY
    await prisma.barber.update({
      where: { id: effectiveBarberId },
      data: { status: BarberStatus.BUSY },
    });

    const updated = await prisma.queueEntry.update({
      where: { id: entryId },
      data: {
        status: QueueStatus.IN_SERVICE,
        startedAt: new Date(),
        barberId: effectiveBarberId,
      },
      include: {
        barber: true,
        services: { include: { service: true } },
      },
    });

    await this.recalculatePositions();
    return updated;
  }

  /**
   * Barber completes service
   */
  async completeService(entryId: string) {
    const entry = await this.getQueueEntryById(entryId);

    if (entry.status !== QueueStatus.IN_SERVICE) {
      throw new BadRequestError(`Cannot complete service for entry with status: ${entry.status}`);
    }

    // Set barber back to AVAILABLE if they aren't on break
    if (entry.barberId) {
      const barber = await prisma.barber.findUnique({ where: { id: entry.barberId } });
      if (barber && barber.status !== BarberStatus.ON_BREAK && barber.status !== BarberStatus.OFFLINE) {
        await prisma.barber.update({
          where: { id: entry.barberId },
          data: { status: BarberStatus.AVAILABLE },
        });
      }
    }

    const updated = await prisma.queueEntry.update({
      where: { id: entryId },
      data: {
        status: QueueStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        barber: true,
        services: { include: { service: true } },
      },
    });

    await this.recalculatePositions();
    return updated;
  }

  /**
   * Customer or Receptionist cancels queue entry
   */
  async cancelQueue(entryId: string) {
    const entry = await this.getQueueEntryById(entryId);

    // If customer was already in service, free up the barber
    if (entry.status === QueueStatus.IN_SERVICE && entry.barberId) {
      await prisma.barber.update({
        where: { id: entry.barberId },
        data: { status: BarberStatus.AVAILABLE },
      });
    }

    const updated = await prisma.queueEntry.update({
      where: { id: entryId },
      data: {
        status: QueueStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    await this.recalculatePositions();
    return updated;
  }

  /**
   * Receptionist marks customer as No-Show
   */
  async markNoShow(entryId: string) {
    await this.getQueueEntryById(entryId);

    const updated = await prisma.queueEntry.update({
      where: { id: entryId },
      data: {
        status: QueueStatus.NO_SHOW,
      },
    });

    await this.recalculatePositions();
    return updated;
  }

  /**
   * Receptionist skips customer (moves to the back of the waiting line)
   */
  async skipCustomer(entryId: string) {
    const entry = await this.getQueueEntryById(entryId);

    // Re-queue by updating joinedAt to right now (puts them last FIFO)
    const updated = await prisma.queueEntry.update({
      where: { id: entryId },
      data: {
        status: QueueStatus.WAITING,
        calledAt: null,
        joinedAt: new Date(),
      },
      include: {
        barber: true,
        services: { include: { service: true } },
      },
    });

    await this.recalculatePositions();
    return updated;
  }

  /**
   * Receptionist assigns specific barber to a queue entry
   */
  async assignBarber(entryId: string, barberId: string) {
    await this.getQueueEntryById(entryId);

    const barber = await prisma.barber.findUnique({ where: { id: barberId } });
    if (!barber || !barber.isActive) {
      throw new BadRequestError('Barber not found or inactive');
    }

    const updated = await prisma.queueEntry.update({
      where: { id: entryId },
      data: { barberId },
      include: {
        barber: true,
        services: { include: { service: true } },
      },
    });

    return updated;
  }

  /**
   * Customer looks up their active token / position
   */
  async getCustomerActiveEntry(phoneOrId: string) {
    return prisma.queueEntry.findFirst({
      where: {
        OR: [{ customerPhone: phoneOrId }, { customerId: phoneOrId }, { tokenNumber: phoneOrId }],
        status: { in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE] },
      },
      include: {
        barber: true,
        services: { include: { service: true } },
      },
    });
  }

  /**
   * Customer queue history
   */
  async getCustomerHistory(phoneOrId: string) {
    return prisma.queueEntry.findMany({
      where: {
        OR: [{ customerPhone: phoneOrId }, { customerId: phoneOrId }],
      },
      orderBy: { joinedAt: 'desc' },
      take: 20,
      include: {
        barber: true,
        services: { include: { service: true } },
      },
    });
  }

  /**
   * Data formatted for TV Display
   */
  async getTVDisplayData() {
    const [activeBarbers, currentQueue, inService, settings] = await Promise.all([
      prisma.barber.findMany({
        where: { isActive: true },
        include: {
          queueEntries: {
            where: { status: QueueStatus.IN_SERVICE },
            include: { services: { include: { service: true } } },
            take: 1,
          },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.queueEntry.findMany({
        where: { status: QueueStatus.WAITING },
        orderBy: { position: 'asc' },
        take: 10,
        include: { services: { include: { service: true } } },
      }),
      prisma.queueEntry.findMany({
        where: { status: QueueStatus.CALLED },
        include: { barber: true, services: { include: { service: true } } },
      }),
      settingsService.getSettings(),
    ]);

    return {
      barbers: activeBarbers,
      waitingQueue: currentQueue,
      calledCustomers: inService,
      settings,
      timestamp: new Date().toISOString(),
    };
  }
}

export const queueService = new QueueService();
