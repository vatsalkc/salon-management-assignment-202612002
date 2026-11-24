import { Request, Response, NextFunction } from 'express';
import { barberService } from '../services/barber.service';
import { BarberStatus } from '@prisma/client';
import { io } from '../server';

export class BarberController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const barbers = await barberService.getAllBarbers(includeInactive);
      res.json({
        success: true,
        data: barbers,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barber = await barberService.getBarberById(req.params.id as string);
      res.json({
        success: true,
        data: barber,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barber = await barberService.createBarber(req.body);
      io.emit('barber:updated', barber);
      res.status(201).json({
        success: true,
        message: 'Barber created successfully',
        data: barber,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barber = await barberService.updateBarber(req.params.id as string, req.body);
      io.emit('barber:updated', barber);
      res.json({
        success: true,
        message: 'Barber updated successfully',
        data: barber,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body as { status: BarberStatus };
      const barber = await barberService.updateStatus(req.params.id as string, status);
      io.emit('barber:status', { barberId: barber.id, status: barber.status, barber });
      res.json({
        success: true,
        message: 'Barber status updated',
        data: barber,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await barberService.deleteBarber(req.params.id as string);
      io.emit('barber:deleted', { id: req.params.id });
      res.json({
        success: true,
        message: 'Barber deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const barberController = new BarberController();
