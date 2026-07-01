import { Router } from 'express'
import {
  createBill,
  createDocument,
  createNotice,
  createProperty,
  createTenant,
  createUnit,
  deleteBill,
  deleteDocument,
  deleteNotice,
  deleteProperty,
  deleteUnit,
  downloadDocument,
  generateRent,
  getDashboard,
  getProperty,
  getSettings,
  getTenant,
  listBills,
  listComplaints,
  listDocuments,
  listNotices,
  listPayments,
  listProperties,
  listTenants,
  listVacantUnits,
  markBillPaid,
  offboardTenant,
  tenantOptions,
  updateComplaint,
  updateNotice,
  updateProperty,
  updateSettings,
  updateTenant,
  updateUnit,
} from '../controllers/admin.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../utils/http.js'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireRole('admin'))

adminRouter.get('/dashboard', asyncHandler(getDashboard))

// Properties + units
adminRouter.get('/properties', asyncHandler(listProperties))
adminRouter.post('/properties', asyncHandler(createProperty))
adminRouter.get('/properties/:id', asyncHandler(getProperty))
adminRouter.patch('/properties/:id', asyncHandler(updateProperty))
adminRouter.delete('/properties/:id', asyncHandler(deleteProperty))
adminRouter.post('/properties/:id/units', asyncHandler(createUnit))
adminRouter.patch('/units/:id', asyncHandler(updateUnit))
adminRouter.delete('/units/:id', asyncHandler(deleteUnit))

// Tenants
adminRouter.get('/tenants', asyncHandler(listTenants))
adminRouter.post('/tenants', asyncHandler(createTenant))
adminRouter.get('/tenant-options', asyncHandler(tenantOptions))
adminRouter.get('/vacant-units', asyncHandler(listVacantUnits))
adminRouter.get('/tenants/:id', asyncHandler(getTenant))
adminRouter.patch('/tenants/:id', asyncHandler(updateTenant))
adminRouter.post('/tenants/:id/offboard', asyncHandler(offboardTenant))

// Billing + payments
adminRouter.get('/bills', asyncHandler(listBills))
adminRouter.post('/bills', asyncHandler(createBill))
adminRouter.post('/bills/generate-rent', asyncHandler(generateRent))
adminRouter.post('/bills/:id/mark-paid', asyncHandler(markBillPaid))
adminRouter.delete('/bills/:id', asyncHandler(deleteBill))
adminRouter.get('/payments', asyncHandler(listPayments))

// Complaints
adminRouter.get('/complaints', asyncHandler(listComplaints))
adminRouter.patch('/complaints/:id', asyncHandler(updateComplaint))

// Notices
adminRouter.get('/notices', asyncHandler(listNotices))
adminRouter.post('/notices', asyncHandler(createNotice))
adminRouter.patch('/notices/:id', asyncHandler(updateNotice))
adminRouter.delete('/notices/:id', asyncHandler(deleteNotice))

// Documents
adminRouter.get('/documents', asyncHandler(listDocuments))
adminRouter.post('/documents', asyncHandler(createDocument))
adminRouter.get('/documents/:id/download', asyncHandler(downloadDocument))
adminRouter.delete('/documents/:id', asyncHandler(deleteDocument))

// Settings
adminRouter.get('/settings', asyncHandler(getSettings))
adminRouter.patch('/settings', asyncHandler(updateSettings))
