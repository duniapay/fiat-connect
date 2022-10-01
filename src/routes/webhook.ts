import axios from 'axios'
import * as dotenv from 'dotenv'
const crypto = require('crypto')

dotenv.config()

import express from 'express'
import { asyncRoute } from './async-route'

export function webhookRouter({
  clientAuthMiddleware,
}: {
  clientAuthMiddleware: express.RequestHandler[]
  client: any
  dataSource: any
}): express.Router {
  const router = express.Router()
  router.use(clientAuthMiddleware)
  router.post(
    '/webhook',
    asyncRoute(async (_req: express.Request, _res: express.Response) => {
      const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
      const PROVIDER_ID = process.env.PROVIDER_ID
      const WEBHOOK_URL = `${process.env.WEBHOOK_URL}/${PROVIDER_ID}`

      const webhook_payload = _req.body

      const hmac = crypto.createHmac('sha1', WEBHOOK_SECRET)

      const webhookDigest = hmac.update(webhook_payload).digest('hex')
      const t = Date.now()
      const options = {
        headers: {
          'FiatConnect-Signature': `t=${t},s=${webhookDigest}`,
        },
        body: { ...webhook_payload },
      }
      return await axios.post(WEBHOOK_URL, options)
    }),
  )

  return router
}
