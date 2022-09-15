import { chaiPlugin } from 'api-contract-validator'
import { expect, use } from 'chai'
import path from 'path'

import axios, { AxiosRequestHeaders } from 'axios'
import { checkResponseSchema } from '../check-response-schema'
import { MOCK_QUOTE } from '../mock-data/quote'
import { ethers } from 'ethers'
import { loadConfig } from '../config'

const { openapiSpec } = loadConfig()

const apiDefinitionsPath = path.join(openapiSpec)
use(chaiPlugin({ apiDefinitionsPath }))

const URL = `http://localhost:8000`

const API_KEY = `http://localhost:8000`

const quote_out_mock = `quoteOutNigeriaCUSD`

const headers: AxiosRequestHeaders = API_KEY
  ? { Authorization: `Bearer ${API_KEY}` }
  : {}

describe('/quote', () => {
  describe('/out', () => {
    const wallet = ethers.Wallet.createRandom()
    const quoteParams = {
      ...MOCK_QUOTE[quote_out_mock],
      address: wallet.address,
    }
    it('gives quote when it should', async () => {
      const client = axios.create({
        baseURL: URL,
        validateStatus: () => true,
        headers,
      })
      const response = await client.post(`/quote/out`, quoteParams)
      expect(response).to.have.status(200)
      checkResponseSchema(response)
    })
    it('Doesnt support quotes for unreasonably large transfer out', async () => {
      const client = axios.create({
        baseURL: URL,
        validateStatus: () => true,
        headers,
      })
      quoteParams.cryptoAmount = Number.MAX_VALUE.toString()
      const response = await client.post(`/quote/out`, quoteParams)
      expect(response).to.have.status(400)
      expect(response.data.error).to.be.equal('CryptoAmountTooHigh')
    })
  })
})
