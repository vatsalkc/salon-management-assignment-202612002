import { prisma } from '../config/database';
import { QueueStatus } from '@prisma/client';

export class StatsService {
  async getDailyStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayEntries, waitingCount] = await Promise.all([
      prisma.queueEntry.findMany({
        where: { joinedAt: { gte: today } },
        include: {
          services: {
            include: { service: true },
          },
        },
      }),
      prisma.queueEntry.count({
        where: { status: QueueStatus.WAITING },
      }),
    ]);

    const completed = todayEntries.filter((e) => e.status === QueueStatus.COMPLETED);
    const cancelled = todayEntries.filter((e) => e.status === QueueStatus.CANCELLED);
    const noShow = todayEntries.filter((e) => e.status === QueueStatus.NO_SHOW);

    // Calculate revenue
    const totalRevenue = completed.reduce((sum, entry) => {
      const entryTotal = entry.services.reduce(
        (sub, s) => sub + (s.service?.price || 0),
        0
      );
      return sum + entryTotal;
    }, 0);

    // Calculate average wait time
    let totalWaitMinutes = 0;
    let completedWithDates = 0;
    for (const entry of completed) {
      if (entry.startedAt && entry.joinedAt) {
        const diffMs = new Date(entry.startedAt).getTime() - new Date(entry.joinedAt).getTime();
        totalWaitMinutes += Math.max(0, Math.floor(diffMs / 60000));
        completedWithDates++;
      }
    }
    const averageWaitMinutes =
      completedWithDates > 0 ? Math.round(totalWaitMinutes / completedWithDates) : 15;

    return {
      customersServed: completed.length,
      customersWaiting: waitingCount,
      averageWaitMinutes,
      totalRevenue,
      cancelledCount: cancelled.length,
      noShowCount: noShow.length,
      totalToday: todayEntries.length,
    };
  }

  async getBarberStats() {
    const barbers = await prisma.barber.findMany({
      where: { isActive: true },
      include: {
        queueEntries: {
          where: { status: QueueStatus.COMPLETED },
          include: { services: { include: { service: true } } },
        },
      },
    });

    return barbers.map((barber) => {
      let totalMinutes = 0;
      for (const entry of barber.queueEntries) {
        if (entry.startedAt && entry.completedAt) {
          const diffMs =
            new Date(entry.completedAt).getTime() - new Date(entry.startedAt).getTime();
          totalMinutes += Math.floor(diffMs / 60000);
        }
      }

      const count = barber.queueEntries.length;
      return {
        barberId: barber.id,
        barberName: barber.name,
        customersServed: count,
        averageServiceMinutes: count > 0 ? Math.round(totalMinutes / count) : 25,
        status: barber.status,
      };
    });
  }

  async getPopularServices() {
    const services = await prisma.service.findMany({
      include: {
        queueEntryServices: {
          include: { queueEntry: true },
        },
      },
    });

    return services
      .map((service) => {
        const completedServices = service.queueEntryServices.filter(
          (qes) => qes.queueEntry.status === QueueStatus.COMPLETED
        );
        const count = completedServices.length;
        return {
          serviceId: service.id,
          serviceName: service.name,
          category: service.category || 'General',
          count,
          revenue: count * service.price,
        };
      })
      .sort((a, b) => b.count - a.count);
  }
}

export const statsService = new StatsService();
