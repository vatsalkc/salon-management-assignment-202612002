import { Request, Response, NextFunction } from 'express';
import { statsService } from '../services/stats.service';

export class StatsController {
  async getDaily(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await statsService.getDailyStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBarbers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await statsService.getBarberStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await statsService.getPopularServices();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const statsController = new StatsController();
