import { Router } from 'express'
import {
  forgotPassword,
  login,
  me,
  register,
  updateProfile,
} from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/http.js'

export const authRouter = Router()

authRouter.post('/register', asyncHandler(register))
authRouter.post('/login', asyncHandler(login))
authRouter.post('/forgot-password', asyncHandler(forgotPassword))
authRouter.get('/me', requireAuth, asyncHandler(me))
authRouter.put('/profile', requireAuth, asyncHandler(updateProfile))
