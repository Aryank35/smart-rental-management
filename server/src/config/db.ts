import dns from 'node:dns'
import mongoose from 'mongoose'
import { env } from './env.js'

/** Connect to MongoDB. Throws (and the caller exits) if the connection fails. */
export async function connectDB() {
  // Override DNS resolvers when configured — works around `querySrv
  // ECONNREFUSED` on ISPs/routers that block Node's SRV lookups.
  if (env.dnsServers.length > 0) {
    dns.setServers(env.dnsServers)
    console.log(`🔧 Using custom DNS servers: ${env.dnsServers.join(', ')}`)
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 15000,
  })
  const { host, name } = mongoose.connection
  console.log(`✅ MongoDB connected → ${host}/${name}`)
}
