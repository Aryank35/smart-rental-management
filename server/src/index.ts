import { createApp } from './app.js'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'

async function main() {
  try {
    await connectDB()
  } catch (err) {
    console.error('❌ Could not connect to MongoDB. Is it running and is MONGODB_URI correct?')
    console.error(err)
    process.exit(1)
  }

  const app = createApp()
  app.listen(env.port, () => {
    console.log(`🚀 TenantFlow API listening on port ${env.port}`)
    console.log(`   Allowed origins: ${env.clientUrls.join(', ')}`)
  })
}

main()
