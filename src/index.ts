import { loadConfig } from './config'
import { getClientAuthMiddleware } from './middleware/authenticate'
import { initApp } from './app'
import { createClient } from 'redis'

async function main() {
  const { port, authConfig, sessionSecret } = loadConfig()

  const clientAuthMiddleware = getClientAuthMiddleware(authConfig)

  const client = createClient()
  await client.connect()

  const app = initApp({
    clientAuthMiddleware,
    sessionSecret,
    chainId: authConfig.chainId,
    client,
  })

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on http://localhost:${port}`)
    client.on('connect', function () {
      console.log('Connected to redis successfully')
    })

    client.on('error', function (err) {
      console.log('Could not establish a connection with redis. ' + err)
    })
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.log(err)
  process.exit(1)
})
