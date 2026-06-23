import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '../utils/http.js'
import { verifyToken, type JwtPayload } from '../utils/token.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: JwtPayload
    }
  }
}

/** Requires a valid `Authorization: Bearer <token>` header. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authentication required.')
  }
  try {
    req.auth = verifyToken(header.slice(7))
    next()
  } catch {
    throw new HttpError(401, 'Session expired or invalid. Please sign in again.')
  }
}

/** Requires the authenticated user to hold a specific role. */
export function requireRole(role: 'tenant' | 'admin') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.auth?.role !== role) {
      throw new HttpError(403, 'You do not have access to this resource.')
    }
    next()
  }
}
