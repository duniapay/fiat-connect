import { createClient } from 'redis'

import * as dotenv from 'dotenv'

dotenv.config()

/// Load private keys from environment variable
const REDIS_HOST =
  process.env.NODE_ENV === 'localhost'
    ? 'redis://localhost:6379'
    : process.env.REDISCLOUD_URL

let redisClient: any

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: REDIS_HOST,
    })
    // check if redis socket is opened
    // eslint-disable-next-line no-console
    redisClient.on('error', (error: any) => console.error(`Error : ${error}`))
    // eslint-disable-next-line no-console
    await redisClient.connect().catch((error: any) => {
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
