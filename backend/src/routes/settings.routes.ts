import { Router } from 'express';
import { z } from 'zod';
import { settingsController } from '../controllers/settings.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

const updateSettingsSchema = z.object({
  salonName: z.string().min(1).optional(),
  isQueueOpen: z.boolean().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  maxQueueSize: z.coerce.number().min(1).optional(),
  timezone: z.string().optional(),
});

const toggleQueueSchema = z.object({
  isOpen: z.boolean(),
});

// Anyone can view settings (public salon hours / open state)
router.get('/', (req, res, next) => settingsController.getSettings(req, res, next));

// Owner only: update settings or open/close queue
router.put(
  '/',
  authenticate,
  authorize(Role.OWNER),
  validate(updateSettingsSchema),
  (req, res, next) => settingsController.updateSettings(req, res, next)
);

router.patch(
  '/toggle-queue',
  authenticate,
  authorize(Role.OWNER, Role.RECEPTIONIST),
  validate(toggleQueueSchema),
  (req, res, next) => settingsController.toggleQueue(req, res, next)
);

export default router;
