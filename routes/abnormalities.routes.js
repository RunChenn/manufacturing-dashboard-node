import { Router } from 'express'
import {
  createAbnormality,
  listAbnormalities,
  updateAbnormalityStatus,
} from '../controllers/abnormalities.controller.js'
import { authMiddleware, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', authMiddleware, requirePermission('dashboard:view'), listAbnormalities)
router.post('/', authMiddleware, requirePermission('abnormal:create'), createAbnormality)
router.patch('/:id/status', authMiddleware, requirePermission('abnormal:update'), updateAbnormalityStatus)

export default router