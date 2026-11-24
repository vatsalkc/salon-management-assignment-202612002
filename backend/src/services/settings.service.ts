import { prisma } from '../config/database';

export interface UpdateSettingsInput {
  salonName?: string;
  isQueueOpen?: boolean;
  openTime?: string;
  closeTime?: string;
  maxQueueSize?: number;
  timezone?: string;
}

export class SettingsService {
  async getSettings() {
    let settings = await prisma.salonSettings.findFirst();
    if (!settings) {
      settings = await prisma.salonSettings.create({
        data: {
          salonName: 'Elite Cuts Salon',
          isQueueOpen: true,
          openTime: '09:00',
          closeTime: '21:00',
          maxQueueSize: 50,
          timezone: 'Asia/Kolkata',
        },
      });
    }
    return settings;
  }

  async updateSettings(input: UpdateSettingsInput) {
    const settings = await this.getSettings();
    return prisma.salonSettings.update({
      where: { id: settings.id },
      data: input,
    });
  }

  async toggleQueue(isOpen: boolean) {
    const settings = await this.getSettings();
    return prisma.salonSettings.update({
      where: { id: settings.id },
      data: { isQueueOpen: isOpen },
    });
  }
}

export const settingsService = new SettingsService();
