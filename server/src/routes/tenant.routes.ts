import { Router } from 'express'
import {
  getDashboard,
  getRentDetails,
  getRentHistory,
} from '../controllers/tenant.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/http.js'

export const tenantRouter = Router()

tenantRouter.use(requireAuth)
tenantRouter.get('/dashboard', asyncHandler(getDashboard))
tenantRouter.get('/rent', asyncHandler(getRentDetails))
tenantRouter.get('/rent/history', asyncHandler(getRentHistory))
