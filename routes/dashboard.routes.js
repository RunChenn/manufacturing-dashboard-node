import { Router } from 'express'
import { getSummary } from '../controllers/dashboard.controller.js'
import { authMiddleware, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/summary', authMiddleware, requirePermission('dashboard:view'), getSummary)

export default router