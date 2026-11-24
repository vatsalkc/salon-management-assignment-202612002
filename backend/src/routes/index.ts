import { Router } from 'express';
import authRoutes from './auth.routes';
import serviceRoutes from './service.routes';
import barberRoutes from './barber.routes';
import queueRoutes from './queue.routes';
import settingsRoutes from './settings.routes';
import statsRoutes from './stats.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/barbers', barberRoutes);
router.use('/queue', queueRoutes);
router.use('/settings', settingsRoutes);
router.use('/stats', statsRoutes);

export default router;
