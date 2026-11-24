import { Request, Response, NextFunction } from 'express';
import { serviceService } from '../services/service.service';

export class ServiceController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const services = await serviceService.getAllServices(includeInactive);
      res.json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await serviceService.getServiceById(req.params.id as string);
      res.json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await serviceService.createService(req.body);
      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await serviceService.updateService(req.params.id as string, req.body);
      res.json({
        success: true,
        message: 'Service updated successfully',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await serviceService.deleteService(req.params.id as string);
      res.json({
        success: true,
        message: 'Service deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const serviceController = new ServiceController();
