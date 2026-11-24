import { Router } from 'express';
import { z } from 'zod';
import { serviceController } from '../controllers/service.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

const createServiceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().min(5, 'Duration must be at least 5 minutes'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
});

const updateServiceSchema = createServiceSchema.partial();

// Public: view active services for queue selection
router.get('/', (req, res, next) => serviceController.getAll(req, res, next));
router.get('/:id', (req, res, next) => serviceController.getById(req, res, next));

// Owner only: create, update, delete
router.post(
  '/',
  authenticate,
  authorize(Role.OWNER),
  validate(createServiceSchema),
  (req, res, next) => serviceController.create(req, res, next)
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.OWNER),
  validate(updateServiceSchema),
  (req, res, next) => serviceController.update(req, res, next)
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.OWNER),
  (req, res, next) => serviceController.delete(req, res, next)
);

export default router;
