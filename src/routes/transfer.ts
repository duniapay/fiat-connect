import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import { TransferRequestBody, TransferStatusRequestParams } from '../types'
import { siweAuthMiddleware } from '../middleware/authenticate'
import { Transfer } from '../entity/transfer.entity'
import {
  CryptoType,
  FiatConnectError,
  FiatType,
  TransferStatus,
  TransferType,
} from '@fiatconnect/fiatconnect-types'
import { ethers } from 'ethers'
import { ensureLeading0x } from '@celo/utils/lib/address'

import * as dotenv from 'dotenv'
import { Quote } from '../entity/quote.entity'
import { Repository } from 'typeorm'

dotenv.config()

/// Load private keys from environment variable
const SENDER_PRIVATE_KEY: string =
  process.env.SENDER_PRIVATE_KEY !== undefined
    ? process.env.SENDER_PRIVATE_KEY
    : ''

const RECEIVER_PRIVATE_KEY: string =
  process.env.RECEIVER_PRIVATE_KEY !== undefined
    ? process.env.RECEIVER_PRIVATE_KEY
    : ''

export function transferRouter({
  clientAuthMiddleware,
  dataSource,
  client,
}: {
  clientAuthMiddleware: express.RequestHandler[]
  dataSource: any
  client: any
}): express.Router {
  const router = express.Router()
  // Load Repository
  const repository = dataSource.getRepository(Transfer)
  const quoteRepository: Repository<Quote> = dataSource.getRepository(Quote)

  const entity = new Transfer()

  router.use(siweAuthMiddleware)
  router.use(clientAuthMiddleware)
  const transferRequestBodyValidator = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.body = validateSchema<TransferRequestBody>(
      req.body,
      'TransferRequestBodySchema',
    )
    next()
  }

  const transferStatusRequestParamsValidator = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.params = validateSchema<TransferStatusRequestParams>(
      req.params,
      'TransferStatusRequestParamsSchema',
    )
    next()
  }

  router.post(
    '/in',
    transferRequestBodyValidator,
    asyncRoute(
      async (
        req: express.Request<{}, {}, TransferRequestBody>,
        res: express.Response,
      ) => {
        const idempotencyKey = req.headers['idempotency-key'] as string
        const isValid = await validateIdempotencyKey(idempotencyKey, client)
        // Check if the idempotency key is already in the cache
        if (isValid) {
          try {
            // Load the corresponding privateKey
            const publicKey = new ethers.utils.SigningKey(SENDER_PRIVATE_KEY)
              .compressedPublicKey
            const transferAddress = ethers.utils.computeAddress(
              ensureLeading0x(publicKey),
            )

            entity.quoteId = req.body.quoteId
            entity.fiatAccountId = req.body.fiatAccountId
            entity.status = TransferStatus.TransferStarted
            entity.transferAddress = transferAddress
            entity.transferType = TransferType.TransferIn
            const quote = await quoteRepository.findOneBy({
              id: req.body.quoteId,
            })
            const fiatAccounts = quote?.fiatAccount;
            const detailledQuote = quote?.quote;
            const kyc = quote?.kyc;

            console.log('fiatAccounts', fiatAccounts)
            console.log('detailledQuote', detailledQuote)
            console.log('kyc', kyc)

            entity.fiatType = FiatType.XOF;
            entity.cryptoType= CryptoType.cUSD;
            entity.amountProvided= 0;
            entity.amountReceived= 0;
            entity.fee= 0;
            const results = await repository.save(entity)
            await markKeyAsUsed(idempotencyKey, client, results.id)

            return res.send({
              transferId: entity.id,
              transferStatus: entity.status,
              // Address from which the transfer will be sent
              transferAddress: entity.transferAddress,
            })
          } catch (error: any) {
            console.log(error)
            console.log(error)
            res.status(409).send({ error: FiatConnectError.ResourceExists })
          }
        }

        res.status(422).send({
          error: `Not Modified`,
        })
      },
    ),
  )

  router.post(
    '/out',
    transferRequestBodyValidator,
    asyncRoute(
      async (
        req: express.Request<{}, {}, TransferRequestBody>,
        res: express.Response,
      ) => {
        const idempotencyKey = req.headers['idempotency-key'] as string
        if (!idempotencyKey) {
          return res
            .status(422)
            .send({ error: FiatConnectError.InvalidParameters })
        }

        const isValid = await validateIdempotencyKey(idempotencyKey, client)

        // Check if the idempotency key is already in the cache
        if (isValid) {
          try {
            // Load the corresponding privateKey

            const publicKey = new ethers.utils.SigningKey(RECEIVER_PRIVATE_KEY)
              .compressedPublicKey
            const transferAddress = ethers.utils.computeAddress(
              ensureLeading0x(publicKey),
            )

            entity.quoteId = req.body.quoteId
            entity.fiatAccountId = req.body.fiatAccountId
            entity.status = TransferStatus.TransferStarted
            entity.transferAddress = transferAddress
            entity.transferType = TransferType.TransferOut
            const quote = await quoteRepository.findOneBy({
              id: req.body.quoteId,
            })
            const fiatAccounts = quote?.fiatAccount;
            const detailledQuote = quote?.quote;
            const kyc = quote?.kyc;
            
            console.log('fiatAccounts', fiatAccounts)
            console.log('detailledQuote', detailledQuote)
            console.log('kyc', kyc)

            entity.fiatType = FiatType.XOF;
            entity.cryptoType= CryptoType.cUSD;
            entity.amountProvided= 0;
            entity.amountReceived= 0;
            entity.fee= 0;
            const results = await repository.save(entity)

            await markKeyAsUsed(idempotencyKey, client, results.id)

            return res.send({
              transferId: results.id,
              transferStatus: entity.status,

              // Address that the user must send funds to
              transferAddress: entity.transferAddress,
            })
          } catch (error: any) {
            console.log(error)
            res.status(409).send({ error: FiatConnectError.ResourceExists })
          }
        }
        res.status(422).send({
          error: `Not Modified`,
        })
      },
    ),
  )

  router.get(
    '/:transferId/status',
    transferStatusRequestParamsValidator,
    asyncRoute(
      async (
        req: express.Request<TransferStatusRequestParams>,
        res: express.Response,
      ) => {
        try {
          const transfer = await repository.findOneBy({
            id: req.params.transferId,
          })
          
          return res.send({
            status: transfer.status,
            transferType: transfer.transferType,
            fiatType: `FiatTypeEnum`,
            cryptoType: `CryptoTypeEnum`,
            amountProvided: `string`,
            amountReceived: `string`,
            fee: `string`,
            fiatAccountId: transfer.fiatAccountId,
            transferId: transfer.id,
            transferAddress: transfer.transferAddress,
          })
        } catch (error) {
          return res
            .status(404)
            .send({ error: FiatConnectError.ResourceNotFound })
        }
      },
    ),
  )

  return router
}

async function validateIdempotencyKey(_nonce: string, _redisClient: any) {
  // must validate that the IdempotencyKey hasn't already been used. If a IdempotencyKey is already used, must throw a InvalidParameters
  // error. e.g. `throw new Error(FiatConnectError.InvalidParameters)`
  try {
    const keyInUse = await _redisClient.get(_nonce)
    // eslint-disable-next-line no-console
    if (keyInUse) {
      return false
    }
    return true
  } catch (error) {
    return false
  }
}

async function markKeyAsUsed(_key: string, _redisClient: any, _id: string) {
  // helper method for storing nonces, which can then be used by the above method.
  try {
    await _redisClient.set(_key, _id, {
      NX: true,
    })
    return true
  } catch (error) {
    return false
  }
}
