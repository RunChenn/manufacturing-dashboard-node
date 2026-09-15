import { Router } from 'express'
import {
  createMaintenanceTicket,
  listMaintenanceTickets,
  updateMaintenanceStatus,
} from '../controllers/maintenance.controller.js'
import { authMiddleware, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', authMiddleware, requirePermission('dashboard:view'), listMaintenanceTickets)
router.post('/', authMiddleware, requirePermission('maintenance:update'), createMaintenanceTicket)
router.patch('/:id/status', authMiddleware, requirePermission('maintenance:update'), updateMaintenanceStatus)

export default router