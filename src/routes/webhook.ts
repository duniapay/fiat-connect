import axios from 'axios'
import * as dotenv from 'dotenv'
import express from 'express'
import { createHmac } from 'crypto'

import { asyncRoute } from './async-route'
import { WebhookEvent } from '../types'
import {
  WebhookEventType,
  WebhookRequestBody,
} from '@fiatconnect/fiatconnect-types'

dotenv.config()

export async function notifyPartner(
  e: WebhookRequestBody<WebhookEventType>,
  secret: any,
) {
  processSomething(() => {
    const providerId = 'dunia-payment'
    const baseUrl =
      'https://liquidity-dot-celo-mobile-alfajores.appspot.com/fiatconnect/webhook/' +
      providerId

    /**
     * Your API call to webhookUrl with
     * your defined body about status of event
     */
    const hmac = createHmac('sha1', secret)

    const webhookDigest = hmac.update(JSON.stringify(e)).digest('hex')
    const t = `t=` + Date.now()
    const s = `v1=` + webhookDigest

    axios.post(
      baseUrl,
      { body: JSON.stringify(e) },
      {
        headers: {
          'Content-Type': 'application/json',
          'fiatconnect-signature': t + ',' + s,
        },
      },
    )
  })
  return true
}

const processSomething = (callback: any) => {
  setTimeout(callback, 10000)
}
