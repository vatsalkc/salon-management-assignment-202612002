import { Router } from 'express';
import { z } from 'zod';
import { barberController } from '../controllers/barber.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

const createBarberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  password: z.string().min(6).optional(),
  specialization: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
});

const updateBarberSchema = z.object({
  name: z.string().min(2).optional(),
  specialization: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
});

const statusSchema = z.object({
  status: z.enum(['AVAILABLE', 'BUSY', 'ON_BREAK', 'OFFLINE']),
});

// Public: view barbers for customer queue selection
router.get('/', (req, res, next) => barberController.getAll(req, res, next));
router.get('/:id', (req, res, next) => barberController.getById(req, res, next));

// Status toggle: Barbers, Receptionists, or Owner can update status
router.patch(
  '/:id/status',
  authenticate,
  authorize(Role.BARBER, Role.RECEPTIONIST, Role.OWNER),
  validate(statusSchema),
  (req, res, next) => barberController.updateStatus(req, res, next)
);

// Owner only: create, update, delete
router.post(
  '/',
  authenticate,
  authorize(Role.OWNER),
  validate(createBarberSchema),
  (req, res, next) => barberController.create(req, res, next)
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.OWNER),
  validate(updateBarberSchema),
  (req, res, next) => barberController.update(req, res, next)
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.OWNER),
  (req, res, next) => barberController.delete(req, res, next)
);

export default router;
