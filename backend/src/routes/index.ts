import { Router } from 'express';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Route modules will be added here as we build them
// router.use('/auth', authRoutes);
// router.use('/queue', queueRoutes);
// router.use('/barbers', barberRoutes);
// router.use('/services', serviceRoutes);
// router.use('/settings', settingsRoutes);
// router.use('/stats', statsRoutes);

export default router;
