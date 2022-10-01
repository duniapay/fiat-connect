import * as dotenv from 'dotenv'

dotenv.config()

export const FIFTEEN_MINUTES_IN_MS = 1000 * 60 * 15
export const ALFAJORES_CHAIN_ID = 44787

export const EXPECTED_API_KEY = process.env.API_KEY
export const MIN_FIAT_AMOUNT = 1000
export const MAX_FIAT_AMOUNT = 10000
export const ONE_MINUTE = 60

export const MIN_CRYPTO_AMOUNT = 0.0004
export const MAX_CRYPTO_AMOUNT = 10

export const USD_XOF_RATE = 650

export const SUPPORTED_COUNTRY_CODE = ['BF', 'CI', 'CMR', 'SN']
