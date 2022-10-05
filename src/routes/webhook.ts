import axios from 'axios'
import * as dotenv from 'dotenv'
import express from 'express'
import { createHmac } from 'crypto'

import { asyncRoute } from './async-route'
import { WebhookEvent } from '../types'

dotenv.config()

export function webhookRouter({
  clientAuthMiddleware,
}: {
  clientAuthMiddleware: express.RequestHandler[]
}): express.Router {
  const router = express.Router()
  router.use(clientAuthMiddleware)
  router.post(
    '/',
    asyncRoute(async (_req: express.Request, _res: express.Response) => {
      const WEBHOOK_URL = _req.body?.url
      const options = {
        baseUrl: 'http://api-staging.dunia.africa',
        body: JSON.stringify(WEBHOOK_URL),
      }
      // Save webhook url
      return axios.post('webhook', options)
    }),
  )
  return router
}

export async function notifyPartner(e: WebhookEvent, secret: any) {
  const hmac = createHmac('sha1', secret)

  const webhookDigest = hmac.update(e.data).digest('hex')
  const t = Date.now()
  const unformattedBody = e.data

  const options = {
    headers: {
      'FiatConnect-Signature': `t=${t},s=${webhookDigest}`,
    },
    body: JSON.stringify({ ...unformattedBody }),
  }
  return axios.post(e.url, options)
}
