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
import {
  isSupportedGeo,
  isValidAmount,
  requestRate,
} from '../utils/quote/index.utils'
import {
  USD_XOF_RATE,
  ONE_MINUTE,
  MIN_CRYPTO_AMOUNT,
  MAX_CRYPTO_AMOUNT,
  MIN_FIAT_AMOUNT,
  MAX_FIAT_AMOUNT,
} from '../constants'

const { coinMarketCapKey, coinMarketCapUrl } = loadConfig()

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
          isSupportedGeo(_req.body)
          isValidAmount(_req.body)
          // Create new Quote Entity
          const quote: any = new Quote()
          const cacheResults = await client.get(_req.body.cryptoType)
          let isCached = false
          let rates

          if (cacheResults) {
            isCached = true
            rates = JSON.parse(cacheResults)
          } else {
            if (_req.body.cryptoAmount) {
              rates = await requestRate(
                _req.body.cryptoType,
                coinMarketCapUrl,
                coinMarketCapKey,
              )
              await client.set(_req.body.cryptoType, JSON.stringify(rates), {
                NX: true,
              })
            }
            if (rates) {
              throw 'API returned an empty array'
            }
          }
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
            quoteId: '',
            transferType: TransferType.TransferIn,
          }
          ;(quote.kyc = {
            kycRequired: true,
            kycSchemas: [
              {
                kycSchema: KycSchema.PersonalDataAndDocuments,
              },
            ],
          }),
            (quote.fiatAccount = {
              [FiatAccountSchema.MobileMoney]: {
                fiatAccountSchemas: [
                  {
                    fiatAccountSchema: FiatAccountSchema.MobileMoney,
                  },
                ],
                fee: 0.02 * Number(_req.body.cryptoAmount),
                feeType: FeeType.PlatformFee,
                feeFrequency: FeeFrequency.OneTime,
              },
              [FiatAccountSchema.DuniaWallet]: {
                fiatAccountSchemas: [
                  {
                    fiatAccountSchema: FiatAccountSchema.DuniaWallet,
                  },
                ],
                fee: 0.01 * Number(_req.body.cryptoAmount),
                feeType: FeeType.PlatformFee,
                feeFrequency: FeeFrequency.OneTime,
              },
            })

          // Save quote in database
          const quoteIn = await dataSource.getRepository(Quote).create(quote)
          await dataSource.getRepository(Quote).save(quoteIn)
          quote.quote.quoteId = quoteIn.id
          console.log('quote.id', quote.quote.quoteId)

          // return get quote/in response
          return _res.send({
            quote: {
              ...quote.quote,
            },
            kyc: { ...quote.kyc },
            fiatAccount: { ...quote.fiatAccount },
          })
        } catch (error: any) {
          console.warn('ERROR', error)
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
              _res.status(400).send({
                error: FiatConnectError.InvalidParameters,
              })
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
          isSupportedGeo(_req.body)
          isValidAmount(_req.body)
          const quote = new Quote()
          let isCached = false

          let tokenPrice = 0
          let rates
          const cacheResults = await client.get(_req.body.cryptoType)

          if (cacheResults) {
            isCached = true
            rates = JSON.parse(cacheResults)
          } else {
            if (_req.body.cryptoAmount) {
              rates = await requestRate(
                _req.body.cryptoType,
                coinMarketCapUrl,
                coinMarketCapKey,
              )
              await client.set(_req.body.cryptoType, JSON.stringify(rates), {
                NX: true,
              })
            }
            if (rates) {
              throw 'API returned an empty array'
            }
          }

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
              fee: 0.02 * Number(_req.body.cryptoAmount),
              feeType: FeeType.PlatformFee,
              feeFrequency: FeeFrequency.OneTime,
            },
            [FiatAccountSchema.DuniaWallet]: {
              fiatAccountSchemas: [
                {
                  fiatAccountSchema: FiatAccountSchema.DuniaWallet,
                },
              ],
              fee: 0.015 * Number(_req.body.cryptoAmount),
              feeType: FeeType.PlatformFee,
              feeFrequency: FeeFrequency.OneTime,
            },
            [FiatAccountSchema.AccountNumber]: {
              fiatAccountSchemas: [
                {
                  fiatAccountSchema: FiatAccountSchema.AccountNumber,
                },
              ],
              fee: 0.025 * Number(_req.body.cryptoAmount),
              feeType: FeeType.PlatformFee,
              feeFrequency: FeeFrequency.OneTime,
            },
          }
          const quoteOut = await dataSource.getRepository(Quote).create(quote)
          await dataSource.getRepository(Quote).save(quoteOut)
          console.log('quote.id', quoteOut.id)

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
              _res.status(400).send({
                error: FiatConnectError.InvalidParameters,
              })
              break
          }
        }
      },
    ),
  )
  return router
}
