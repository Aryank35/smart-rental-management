import { Router } from 'express'
import {
  createComplaint,
  getDashboard,
  getComplaints,
  getRentDetails,
  getRentHistory,
  getUtilityBills,
  payBills,
} from '../controllers/tenant.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/http.js'

export const tenantRouter = Router()

tenantRouter.use(requireAuth)
tenantRouter.get('/dashboard', asyncHandler(getDashboard))
tenantRouter.get('/rent', asyncHandler(getRentDetails))
tenantRouter.get('/rent/history', asyncHandler(getRentHistory))
tenantRouter.post('/pay', asyncHandler(payBills))
tenantRouter.get('/bills', asyncHandler(getUtilityBills))
tenantRouter.get('/complaints', asyncHandler(getComplaints))
tenantRouter.post('/complaints', asyncHandler(createComplaint))
