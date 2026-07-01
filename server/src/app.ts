import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { authRouter } from './routes/auth.routes.js'
import { tenantRouter } from './routes/tenant.routes.js'
import { adminRouter } from './routes/admin.routes.js'
import { errorHandler, notFound } from './middleware/error.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin(origin, cb) {
        // Allow same-origin / non-browser requests (curl, server-to-server).
        if (!origin) return cb(null, true)
        const normalized = origin.replace(/\/$/, '')
        const allowed =
          env.clientUrls.includes(normalized) ||
          (env.allowVercelPreviews && /\.vercel\.app$/.test(new URL(origin).hostname))
        return allowed ? cb(null, true) : cb(new Error(`CORS blocked: ${origin}`))
      },
      credentials: true,
    })
  )
  app.use(express.json({ limit: '5mb' })) // 5mb to allow base64 avatar uploads

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
  app.use('/api/auth', authRouter)
  app.use('/api/tenant', tenantRouter)
  app.use('/api/admin', adminRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
