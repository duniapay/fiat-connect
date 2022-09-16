/* eslint-disable no-console */

import * as dotenv from 'dotenv'

dotenv.config()

import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import { QuoteRequestBody } from '../types'
import { Quote } from '../entity/quote.entity'
import axios, { AxiosRequestHeaders } from 'axios'
import { v4 as uuidv4, v4 } from 'uuid'

import {
  CryptoType,
  FeeFrequency,
  FeeType,
  FiatAccountSchema,
  FiatConnectError,
  FiatType,
  KycSchema,
  TransferType,
} from '@fiatconnect/fiatconnect-types'
import { loadConfig } from '../config'

const { coinMarketCapKey, coinMarketCapUrl } = loadConfig()

const MIN_FIAT_AMOUNT = 1000
const MAX_FIAT_AMOUNT = 10000
const ONE_MINUTE = 60

const MIN_CRYPTO_AMOUNT = 0.0004
const MAX_CRYPTO_AMOUNT = 10

const USD_XOF_RATE = 650

export function quoteRouter({
  clientAuthMiddleware,
  client,
  dataSource,
}: {
  clientAuthMiddleware: express.RequestHandler[]
  client: any
  dataSource: any
}): express.Router {
  const router = express.Router()
  router.use(clientAuthMiddleware)

  router.use(
    (
      req: express.Request,
      _res: express.Response,
      next: express.NextFunction,
    ) => {
      req.body = validateSchema<QuoteRequestBody>(
        req.body,
        'QuoteRequestBodySchema',
      )
      next()
    },
  )

  const SUPPORTED_COUNTRY_CODE = ['BF', 'CI', 'CMR', 'SN']

  /**
   * The `POST /quote/in endpoint is used to retrieve quotes used
   * for transfer in to crypto from fiat currencies
   */
  router.post(
    '/in',
    asyncRoute(
      async (
        _req: express.Request<{}, {}, QuoteRequestBody>,
        _res: express.Response,
      ) => {
        try {
          isSupportedGeo(
            _req.body.country,
            _req.body.fiatType,
            SUPPORTED_COUNTRY_CODE,
          )
          isSupportedFiat(_req.body)
          isSupportedCrypto(_req.body)
          isValidAmount(_req.body)
          // Create new Quote Entity
          const quote = new Quote()
          quote.id = v4()

          // Get live rates from CoinmarketCap API
          const rates = await requestRate(_req.body.cryptoType)
          const tokenPrice =
            rates[_req.body.cryptoType.toUpperCase()].quote.USD?.price

          // Estimate fiat amount
          const fiatAmount =
            Number(_req.body.cryptoAmount) * Number(tokenPrice) * USD_XOF_RATE
          // Estimate crypto amount

          const cryptoAmount = Number(_req.body.fiatAmount) / USD_XOF_RATE
          // Set quote validity
          const guaranteedUntil = new Date()
          guaranteedUntil.setSeconds(guaranteedUntil.getSeconds() + ONE_MINUTE)

          // Set quote properties
          quote.quote = {
            ..._req.body,
            fiatAmount: _req.body.cryptoAmount
              ? fiatAmount.toFixed(2)
              : _req.body.fiatAmount,
            cryptoAmount: _req.body.fiatAmount
              ? cryptoAmount
              : _req.body.cryptoAmount,
            guaranteedUntil: guaranteedUntil,
            quoteId: quote.id,
            transferType: TransferType.TransferIn,
          }

          quote.kyc = {
            kycRequired: true,
            kycSchemas: [
              {
                kycSchema: KycSchema.PersonalDataAndDocuments,
              },
            ],
          }
          quote.fiatAccount = {
            [FiatAccountSchema.MobileMoney]: {
              fiatAccountSchemas: [
                {
                  fiatAccountSchema: FiatAccountSchema.MobileMoney,
                },
              ],
              fee: 0.025,
              feeType: FeeType.PlatformFee,
              feeFrequency: FeeFrequency.OneTime,
            },
            [FiatAccountSchema.DuniaWallet]: {
              fiatAccountSchemas: [
                {
                  fiatAccountSchema: FiatAccountSchema.DuniaWallet,
                },
              ],
              fee: 0.5,
              feeType: FeeType.PlatformFee,
              feeFrequency: FeeFrequency.OneTime,
            },
          }

          // Save quote in database
          const quoteOut = await dataSource.getRepository(Quote).create(quote)
          await dataSource.getRepository(Quote).save(quoteOut)

          // return get quote/in response
          return _res.send({ ...quote })
        } catch (error: any) {
          switch (error.message) {
            case FiatConnectError.CryptoNotSupported:
              _res.status(400).send({
                error: error.message,
              })
              break
            case FiatConnectError.CryptoAmountTooLow:
              _res.status(400).send({
                error: error.message,
                minimumCryptoAmount: MIN_CRYPTO_AMOUNT,
              })
              break
            case FiatConnectError.CryptoAmountTooHigh:
              _res.status(400).send({
                error: error.message,
                maximumCryptoAmount: MAX_CRYPTO_AMOUNT,
              })
              break
            case FiatConnectError.FiatAmountTooLow:
              _res.status(400).send({
                error: error.message,
                minimumFiatAmount: MIN_FIAT_AMOUNT,
              })
              break
            case FiatConnectError.FiatAmountTooHigh:
              _res.status(400).send({
                error: error.message,
                maximumFiatAmount: MAX_FIAT_AMOUNT,
              })
              break
            case FiatConnectError.GeoNotSupported:
              _res.status(400).send({
                error: FiatConnectError.GeoNotSupported,
              })
              break
            case FiatConnectError.FiatNotSupported:
              _res.status(400).send({
                error: FiatConnectError.FiatNotSupported,
              })
              break
            default:
              break
          }
        }
      },
    ),
  )

  /**
   * The `POST /quote/out endpoint is used to retrieve quotes used
   * for transfers out from crypto to fiat currencies
   */
  router.post(
    '/out',
    asyncRoute(
      async (
        _req: express.Request<{}, {}, QuoteRequestBody>,
        _res: express.Response,
      ) => {
        try {
          isSupportedGeo(
            _req.body.country,
            _req.body.fiatType,
            SUPPORTED_COUNTRY_CODE,
          )
          isSupportedFiat(_req.body)
          isSupportedCrypto(_req.body)
          isValidAmount(_req.body)
          const quote = new Quote()
          quote.id = v4()

          let tokenPrice = 0
          let rates
          if (_req.body.cryptoAmount)
            rates = await requestRate(_req.body.cryptoType)
          tokenPrice =
            rates[_req.body.cryptoType.toUpperCase()].quote.USD?.price

          const fiatAmount =
            Number(_req.body.cryptoAmount) * Number(tokenPrice) * USD_XOF_RATE
          const cryptoAmount = Number(_req.body.fiatAmount) / USD_XOF_RATE
          const guaranteedUntil = new Date()
          guaranteedUntil.setSeconds(guaranteedUntil.getSeconds() + ONE_MINUTE)

          quote.quote = {
            ..._req.body,
            fiatAmount: _req.body.cryptoAmount
              ? fiatAmount.toFixed(2)
              : _req.body.fiatAmount,
            cryptoAmount: _req.body.fiatAmount
              ? cryptoAmount
              : _req.body.cryptoAmount,
            guaranteedUntil: guaranteedUntil,
            quoteId: quote.id,
            transferType: TransferType.TransferIn,
          }
          quote.kyc = {
            kycRequired: true,
            kycSchemas: [
              {
                kycSchema: KycSchema.PersonalDataAndDocuments,
              },
            ],
          }
          quote.fiatAccount = {
            [FiatAccountSchema.MobileMoney]: {
              fiatAccountSchemas: [
                {
                  fiatAccountSchema: FiatAccountSchema.MobileMoney,
                },
              ],
              fee: 0.025,
              feeType: FeeType.PlatformFee,
              feeFrequency: FeeFrequency.OneTime,
            },
            [FiatAccountSchema.DuniaWallet]: {
              fiatAccountSchemas: [
                {
                  fiatAccountSchema: FiatAccountSchema.DuniaWallet,
                },
              ],
              fee: 0.5,
              feeType: FeeType.PlatformFee,
              feeFrequency: FeeFrequency.OneTime,
            },
            [FiatAccountSchema.AccountNumber]: {
              fiatAccountSchemas: [
                {
                  fiatAccountSchema: FiatAccountSchema.AccountNumber,
                },
              ],
              fee: 1,
              feeType: FeeType.PlatformFee,
              feeFrequency: FeeFrequency.OneTime,
            },
          }
          const quoteOut = await dataSource.getRepository(Quote).create(quote)
          await dataSource.getRepository(Quote).save(quoteOut)
          return _res.send({ ...quote })
        } catch (error: any) {
          switch (error.message) {
            case FiatConnectError.CryptoNotSupported:
              _res.status(400).send({
                error: error.message,
              })
              break
            case FiatConnectError.CryptoAmountTooLow:
              _res.status(400).send({
                error: error.message,
                minimumCryptoAmount: MIN_CRYPTO_AMOUNT,
              })
              break
            case FiatConnectError.CryptoAmountTooHigh:
              _res.status(400).send({
                error: error.message,
                maximumCryptoAmount: MAX_CRYPTO_AMOUNT,
              })
              break
            case FiatConnectError.FiatAmountTooLow:
              _res.status(400).send({
                error: error.message,
                minimumFiatAmount: MIN_FIAT_AMOUNT,
              })
              break
            case FiatConnectError.FiatAmountTooHigh:
              _res.status(400).send({
                error: error.message,
                maximumFiatAmount: MAX_FIAT_AMOUNT,
              })
              break
            case FiatConnectError.FiatNotSupported:
              _res.status(400).send({
                error: FiatConnectError.FiatNotSupported,
              })
              break
            case FiatConnectError.GeoNotSupported:
              _res.status(400).send({
                error: FiatConnectError.GeoNotSupported,
              })
              break
            default:
              break
          }
        }
      },
    ),
  )
  return router
}

/// Verify if is supported Crypto
function isSupportedCrypto(body: QuoteRequestBody) {
  if (body.cryptoType === CryptoType.cREAL) {
    throw new Error(FiatConnectError.CryptoNotSupported)
  }
}

/// Verify if is supported Crypto
function isSupportedFiat(body: QuoteRequestBody) {
  if (body.fiatType !== FiatType.XOF) {
    throw new Error(FiatConnectError.FiatNotSupported)
  }
}

/// Validate Quote Amounts
function isValidAmount(body: QuoteRequestBody) {
  const cryptoAmount =
    body.cryptoAmount !== null ? Number(body?.cryptoAmount) : null
  const fiatAmount = body.fiatAmount !== null ? Number(body?.fiatAmount) : null

  if (cryptoAmount !== null) {
    if (cryptoAmount < MIN_CRYPTO_AMOUNT) {
      throw new Error(FiatConnectError.CryptoAmountTooLow)
    } else if (cryptoAmount > MAX_CRYPTO_AMOUNT) {
      throw new Error(FiatConnectError.CryptoAmountTooHigh)
    }
  }
  // Validate Fiat amount
  if (fiatAmount !== null) {
    if (fiatAmount < MIN_FIAT_AMOUNT) {
      throw new Error(FiatConnectError.FiatAmountTooLow)
    } else if (fiatAmount > MAX_FIAT_AMOUNT) {
      throw new Error(FiatConnectError.FiatAmountTooHigh)
    }
  }
}

function isSupportedGeo(
  country: string,
  fiatType: FiatType,
  supportedCountries: string[],
) {
  // is Geo Supported
  const isSupported = supportedCountries.find((ctr) => {
    return ctr === country
  })

  if (!isSupported) {
    throw new Error(FiatConnectError.GeoNotSupported)
  }

  // Fiat Type should be allowed in GEO
  switch (fiatType) {
    case FiatType.XOF:
      if (country !== 'BF') {
        throw new Error(FiatConnectError.GeoNotSupported)
      }
      break
    case FiatType.XAF:
      if (country !== 'CMR') {
        throw new Error(FiatConnectError.GeoNotSupported)
      }
      // Check if one of supported country
      break
    default:
      break
  }
}

export async function requestRate(params: CryptoType) {
  const d = await axios.get(
    `${coinMarketCapUrl}/cryptocurrency/quotes/latest`,
    {
      headers: {
        'X-CMC_PRO_API_KEY': coinMarketCapKey,
      },
      params: { symbol: params },
    },
  )
  return d.data?.data
}
