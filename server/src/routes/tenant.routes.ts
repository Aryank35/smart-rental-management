import { Router } from 'express'
import {
  createComplaint,
  downloadDocument,
  getComplaints,
  getDashboard,
  getDocuments,
  getNotices,
  getPaymentHistory,
  getRentDetails,
  getRentHistory,
  getUtilityBills,
  markNoticeRead,
  payBills,
} from '../controllers/tenant.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../utils/http.js'

export const tenantRouter = Router()

tenantRouter.use(requireAuth, requireRole('tenant'))
tenantRouter.get('/dashboard', asyncHandler(getDashboard))
tenantRouter.get('/rent', asyncHandler(getRentDetails))
tenantRouter.get('/rent/history', asyncHandler(getRentHistory))
tenantRouter.post('/pay', asyncHandler(payBills))
tenantRouter.get('/bills', asyncHandler(getUtilityBills))
tenantRouter.get('/complaints', asyncHandler(getComplaints))
tenantRouter.post('/complaints', asyncHandler(createComplaint))
tenantRouter.get('/notices', asyncHandler(getNotices))
tenantRouter.post('/notices/:id/read', asyncHandler(markNoticeRead))
tenantRouter.get('/payments', asyncHandler(getPaymentHistory))
tenantRouter.get('/documents', asyncHandler(getDocuments))
tenantRouter.get('/documents/:id/download', asyncHandler(downloadDocument))
