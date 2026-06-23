import dotenv from 'dotenv'

dotenv.config()

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/tenantflow'),
  jwtSecret: required('JWT_SECRET', 'dev-insecure-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  port: Number(process.env.PORT ?? 4000),
  /** Allowed CORS origins — comma-separated, e.g. "http://localhost:5173,https://app.vercel.app". */
  clientUrls: (process.env.CLIENT_URL ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean),
  /** Allow any *.vercel.app origin (handy for Vercel preview deployments). */
  allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS === 'true',
  isProd: process.env.NODE_ENV === 'production',
  /**
   * Optional comma-separated DNS servers (e.g. "8.8.8.8,1.1.1.1").
   * Fixes `querySrv ECONNREFUSED` on routers/ISPs whose DNS refuses Node's
   * SRV lookups for mongodb+srv:// URIs.
   */
  dnsServers: (process.env.DNS_SERVERS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
}
