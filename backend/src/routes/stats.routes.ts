import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.OWNER));

router.get('/daily', (req, res, next) => statsController.getDaily(req, res, next));
router.get('/barbers', (req, res, next) => statsController.getBarbers(req, res, next));
router.get('/services', (req, res, next) => statsController.getServices(req, res, next));

export default router;
