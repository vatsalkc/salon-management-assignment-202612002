import { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service';
import { io } from '../server';

export class SettingsController {
  async getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await settingsService.getSettings();
      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await settingsService.updateSettings(req.body);
      io.emit('settings:updated', settings);
      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isOpen } = req.body;
      const settings = await settingsService.toggleQueue(isOpen);
      io.emit('settings:updated', settings);
      res.json({
        success: true,
        message: `Queue has been ${isOpen ? 'opened' : 'closed'}`,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
