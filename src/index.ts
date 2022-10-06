import { loadConfig } from './config'
import { getClientAuthMiddleware } from './middleware/authenticate'
import { initApp } from './app'
import { AppDataSource } from './utils/data-source'
import { redisClient, connectRedis } from './utils/connectRedis'

async function main() {
  const { port, authConfig, sessionSecret } = loadConfig()

  const clientAuthMiddleware = getClientAuthMiddleware(authConfig)

  const client = redisClient

  await connectRedis()

  const app = initApp({
    clientAuthMiddleware,
    sessionSecret,
    chainId: authConfig.chainId,
    client,
  })

  AppDataSource.initialize()
    .then(async () => {
      // start express server
      app.listen(port, '0.0.0.0')
      // eslint-disable-next-line no-console
    })
    .catch((error) => console.log(error))
}

main()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Server Started !')
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err)
    process.exit(1)
  })
