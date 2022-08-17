import axios from 'axios'
import { expect, use } from 'chai'
import { FIFTEEN_MINUTES_IN_MS } from '../../src/constants'
import path from 'path'
import { chaiPlugin } from 'api-contract-validator'
import { checkResponseSchema } from '../../src/check-response-schema'
import { loadConfig } from '../config'

const { openapiSpec } = loadConfig()

const apiDefinitionsPath = path.join(openapiSpec)
use(chaiPlugin({ apiDefinitionsPath }))

describe('/clock', () => {
  it("returns the server's current time", async () => {
    const client = axios.create({
      baseURL: `http://localhost:8000`,
      validateStatus: () => true,
    })
    const response = await client.get(`/clock`)
    expect(response).to.have.status(200)
    checkResponseSchema(response)
    const serverTimeStr = response.data?.time
    expect(!!serverTimeStr).to.be.true
    const serverTime = new Date(serverTimeStr)
    expect(Math.abs(serverTime.getTime() - Date.now())).to.be.lt(
      FIFTEEN_MINUTES_IN_MS,
    )
  })
})
