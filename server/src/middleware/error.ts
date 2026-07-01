import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import mongoose from 'mongoose'
import { HttpError } from '../utils/http.js'

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: 'Route not found.' })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: err.flatten().fieldErrors,
    })
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message })
  }

  // Malformed ObjectId in a route param / body.
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'Invalid identifier.' })
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(422).json({ message: 'Validation failed.', errors: {} })
  }

  // Duplicate key (e.g. email/phone already registered).
  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? { field: 1 })[0]
    return res.status(409).json({ message: `An account with this ${field} already exists.` })
  }

  console.error('Unhandled error:', err)
  return res.status(500).json({ message: 'Something went wrong. Please try again.' })
}
