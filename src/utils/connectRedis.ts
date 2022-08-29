import { createClient } from 'redis'

import * as dotenv from 'dotenv'

dotenv.config()

/// Load private keys from environment variable
const REDISCLOUD_URL = process.env.NODE_ENV === 'production' ? process.env.REDISCLOUD_URL : 'redis://localhost:6379'

const redisClient = createClient({
  url: REDISCLOUD_URL,
})

const connectRedis = async () => {
  try {
    // eslint-disable-next-line no-console
    redisClient.on('error', (error) => console.error(`Error : ${error}`))
    // eslint-disable-next-line no-console
    await redisClient.connect().catch((error) => {
      console.log(error)
    })
    // eslint-disable-next-line no-console
    console.log('Redis client connected successfully')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error)
    setTimeout(connectRedis, 5000)
  }
}

void connectRedis()

export { redisClient, connectRedis }
