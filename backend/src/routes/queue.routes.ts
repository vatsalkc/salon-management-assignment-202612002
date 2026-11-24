import { Router } from 'express';
import { z } from 'zod';
import { queueController } from '../controllers/queue.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

const joinQueueSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().min(8, 'Phone number is required'),
  serviceIds: z.array(z.string()).min(1, 'Select at least one service'),
  barberId: z.string().optional().nullable(),
  notes: z.string().optional(),
});

const assignSchema = z.object({
  barberId: z.string().min(1, 'Barber ID is required'),
});

// Public / Customer: Join queue (authenticated or guest walk-in)
router.post('/join', validate(joinQueueSchema), (req, res, next) =>
  queueController.join(req, res, next)
);

// Public / TV Display route
router.get('/tv', (req, res, next) => queueController.getTVData(req, res, next));

// Public / Customer status checks
router.get('/my-position', (req, res, next) =>
  queueController.getCustomerActive(req, res, next)
);
router.get('/history', (req, res, next) =>
  queueController.getCustomerHistory(req, res, next)
);
router.get('/entry/:id', (req, res, next) =>
  queueController.getById(req, res, next)
);

// Cancel (customer or staff)
router.patch('/:id/cancel', (req, res, next) =>
  queueController.cancel(req, res, next)
);

// Staff / Receptionist / Barber / Owner: Live queue
router.get(
  '/',
  authenticate,
  authorize(Role.RECEPTIONIST, Role.BARBER, Role.OWNER),
  (req, res, next) => queueController.getLiveQueue(req, res, next)
);

// Call Next Customer (Receptionist / Owner)
router.patch(
  '/call-next',
  authenticate,
  authorize(Role.RECEPTIONIST, Role.OWNER),
  (req, res, next) => queueController.callNext(req, res, next)
);
router.patch(
  '/:id/call',
  authenticate,
  authorize(Role.RECEPTIONIST, Role.OWNER),
  (req, res, next) => queueController.callNext(req, res, next)
);

// Start Service (Barber / Receptionist / Owner)
router.patch(
  '/:id/start',
  authenticate,
  authorize(Role.BARBER, Role.RECEPTIONIST, Role.OWNER),
  (req, res, next) => queueController.startService(req, res, next)
);

// Complete Service (Barber / Receptionist / Owner)
router.patch(
  '/:id/complete',
  authenticate,
  authorize(Role.BARBER, Role.RECEPTIONIST, Role.OWNER),
  (req, res, next) => queueController.completeService(req, res, next)
);

// Mark No-Show (Receptionist / Owner)
router.patch(
  '/:id/no-show',
  authenticate,
  authorize(Role.RECEPTIONIST, Role.OWNER),
  (req, res, next) => queueController.markNoShow(req, res, next)
);

// Skip Customer (Receptionist / Owner)
router.patch(
  '/:id/skip',
  authenticate,
  authorize(Role.RECEPTIONIST, Role.OWNER),
  (req, res, next) => queueController.skip(req, res, next)
);

// Assign Barber (Receptionist / Owner)
router.patch(
  '/:id/assign',
  authenticate,
  authorize(Role.RECEPTIONIST, Role.OWNER),
  validate(assignSchema),
  (req, res, next) => queueController.assign(req, res, next)
);

export default router;
