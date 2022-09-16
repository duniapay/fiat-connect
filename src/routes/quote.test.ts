import { chaiPlugin } from 'api-contract-validator'
import { expect, use } from 'chai'
import path from 'path'

import axios, { AxiosRequestHeaders } from 'axios'
import { checkResponseSchema } from '../check-response-schema'
import { MOCK_QUOTE } from '../mock-data/quote'
import { ethers } from 'ethers'
import { loadConfig } from '../config'
import { CryptoType } from '@fiatconnect/fiatconnect-types'

const { openapiSpec } = loadConfig()

const COIN_MARKET_CAP_BASE_URL = `https://sandbox-api.coinmarketcap.com/v1`
const COIN_MARKET_CAP_KEY = `8e434527-ebeb-4833-98ba-1da2ab55ebc5`
const headers: AxiosRequestHeaders = COIN_MARKET_CAP_KEY
  ? { 'X-CMC_PRO_API_KEY': COIN_MARKET_CAP_KEY }
  : {}

describe('/quote', () => {
  describe('/utils', () => {
    it('return rates from exchange', async () => {
      const client = axios.create({
        baseURL: COIN_MARKET_CAP_BASE_URL,
        validateStatus: () => true,
        headers,
        params: { symbol: CryptoType.CELO },
      })
      const response = await client.get(
        `${COIN_MARKET_CAP_BASE_URL}/cryptocurrency/quotes/latest`,
      )
      console.log('response', response)
      expect(response).to.have.status(200)
    })
  })
})
