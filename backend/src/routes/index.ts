import { Router } from 'express';
import authRoutes from './auth.routes';

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
// router.use('/queue', queueRoutes);
// router.use('/barbers', barberRoutes);
// router.use('/services', serviceRoutes);
// router.use('/settings', settingsRoutes);
// router.use('/stats', statsRoutes);

export default router;
