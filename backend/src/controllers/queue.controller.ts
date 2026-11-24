import { Request, Response, NextFunction } from 'express';
import { queueService } from '../services/queue.service';
import { io } from '../server';

export class QueueController {
  private async notifyQueueUpdate() {
    const liveQueue = await queueService.getLiveQueue();
    const tvData = await queueService.getTVDisplayData();
    io.emit('queue:updated', { liveQueue, tvData });
  }

  async join(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await queueService.joinQueue({
        ...req.body,
        customerId: req.user?.id,
      });

      await this.notifyQueueUpdate();

      res.status(201).json({
        success: true,
        message: 'Successfully joined the queue',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLiveQueue(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queue = await queueService.getLiveQueue();
      res.json({
        success: true,
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await queueService.getQueueEntryById(req.params.id as string);
      res.json({
        success: true,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identifier = req.user?.phone || req.user?.id || (req.query.phone as string);
      if (!identifier) {
        res.status(400).json({ success: false, message: 'Phone number or auth required' });
        return;
      }
      const entry = await queueService.getCustomerActiveEntry(identifier);
      res.json({
        success: true,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identifier = req.user?.phone || req.user?.id || (req.query.phone as string);
      if (!identifier) {
        res.status(400).json({ success: false, message: 'Phone number or auth required' });
        return;
      }
      const history = await queueService.getCustomerHistory(identifier);
      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async callNext(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entryId = req.params.id ? (req.params.id as string) : undefined;
      const { barberId } = req.body;
      const entry = await queueService.callNextCustomer(entryId, barberId);

      io.emit('queue:called', entry);
      await this.notifyQueueUpdate();

      res.json({
        success: true,
        message: `Customer ${entry.customerName} (${entry.tokenNumber}) called`,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  async startService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entryId = req.params.id as string;
      const barberId = req.user?.barberId || req.body.barberId;
      const entry = await queueService.startService(entryId, barberId);

      await this.notifyQueueUpdate();

      res.json({
        success: true,
        message: 'Service started',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  async completeService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entryId = req.params.id as string;
      const entry = await queueService.completeService(entryId);

      await this.notifyQueueUpdate();

      res.json({
        success: true,
        message: 'Service completed successfully',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entryId = req.params.id as string;
      const entry = await queueService.cancelQueue(entryId);

      await this.notifyQueueUpdate();

      res.json({
        success: true,
        message: 'Queue entry cancelled',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  async markNoShow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entryId = req.params.id as string;
      const entry = await queueService.markNoShow(entryId);

      await this.notifyQueueUpdate();

      res.json({
        success: true,
        message: 'Customer marked as no-show',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  async skip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entryId = req.params.id as string;
      const entry = await queueService.skipCustomer(entryId);

      await this.notifyQueueUpdate();

      res.json({
        success: true,
        message: 'Customer moved to the end of queue',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entryId = req.params.id as string;
      const { barberId } = req.body;
      const entry = await queueService.assignBarber(entryId, barberId);

      await this.notifyQueueUpdate();

      res.json({
        success: true,
        message: 'Barber assigned to customer',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTVData(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tvData = await queueService.getTVDisplayData();
      res.json({
        success: true,
        data: tvData,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const queueController = new QueueController();
