import { Router } from 'express';

import userRoutes from './user.routes';
import teacherRoutes from './teacher.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

router.use('/users', userRoutes);
router.use('/teachers', teacherRoutes);

export default router;
