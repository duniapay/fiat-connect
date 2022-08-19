import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import {
  TransferRequestBody,
  TransferStatusRequestParams,
  NotImplementedError,
} from '../types'
import { siweAuthMiddleware } from '../middleware/authenticate'
import { Transfer } from '../entity/transfer.entity'
import { FiatConnectError, TransferStatus, TransferType } from '@fiatconnect/fiatconnect-types'

export function transferRouter({
  clientAuthMiddleware,
  dataSource,
}: {
  clientAuthMiddleware: express.RequestHandler[]
  dataSource: any
}): express.Router {
  const router = express.Router()
    // Load Repository
    const repository = dataSource.getRepository(Transfer)
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
        try {
          entity.quoteId = req.body.quoteId
          entity.fiatAccountId = req.body.fiatAccountId
          entity.status = TransferStatus.TransferStarted
          entity.transferAddress = '0x' + Math.random().toString(36).substr(2, 10)
          entity.transferType = TransferType.TransferIn

          const results = await repository
            .save(entity)
          return res.send({   
            transferId: entity.id,
            transferStatus: entity.status,
            // Address from which the transfer will be sent 
            transferAddress: entity.transferAddress,
          })
        } catch (error) {
          console.log(error)

          return res
          .status(409)
          .send({ error: FiatConnectError.ResourceExists })        }
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
        try {
          entity.quoteId = req.body.quoteId
          entity.fiatAccountId = req.body.fiatAccountId
          entity.status = TransferStatus.TransferStarted
          entity.transferAddress = '0x' + Math.random().toString(36).substr(2, 10)
          entity.transferType = TransferType.TransferOut

          const results =  await repository
            .save(entity)


            return res.send({   
              transferId: results.id,
              transferStatus: entity.status,
              
              // Address that the user must send funds to
              transferAddress: entity.transferAddress,
            })
        } catch (error) {
          console.log(error)

          return res
          .status(409)
          .send({ error: FiatConnectError.ResourceExists })        }
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
          return res.send(
            {
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
            }
          )
        } catch (error) {
          console.log(error)
          return res
          .status(404)
          .send({ error: FiatConnectError.ResourceNotFound })
        }
      },
    ),
  )

  return router
}
