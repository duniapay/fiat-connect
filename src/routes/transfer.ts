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

export function transferRouter({
  clientAuthMiddleware,
  dataSource,
}: {
  clientAuthMiddleware: express.RequestHandler[]
  dataSource: any
}): express.Router {
  const router = express.Router()

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
        _req: express.Request<{}, {}, TransferRequestBody>,
        _res: express.Response,
      ) => {
        try {
          const transferOut = await dataSource
            .getRepository(Transfer)
            .create(_req.body)
          const results = await dataSource
            .getRepository(Transfer)
            .save(transferOut)
          return _res.send(results)
        } catch (error) {
          throw new NotImplementedError('POST /transfer/in failure')
        }
      },
    ),
  )

  router.post(
    '/out',
    transferRequestBodyValidator,
    asyncRoute(
      async (
        _req: express.Request<{}, {}, TransferRequestBody>,
        _res: express.Response,
      ) => {
        try {
          const transferOut = await dataSource
            .getRepository(Transfer)
            .create(_req.body)
          const results = await dataSource
            .getRepository(Transfer)
            .save(transferOut)
          return _res.send(results)
        } catch (error) {
          throw new NotImplementedError('POST /transfer/out failure')
        }
      },
    ),
  )

  router.get(
    '/:transferId/status',
    transferStatusRequestParamsValidator,
    asyncRoute(
      async (
        _req: express.Request<TransferStatusRequestParams>,
        _res: express.Response,
      ) => {
        try {
          const transfer = await dataSource.getRepository(Transfer).findOneBy({
            id: _req.params.transferId,
          })
          return _res.send(transfer)
        } catch (error) {
          throw new NotImplementedError(
            'GET /transfer/:transferId/status failure',
          )
        }
      },
    ),
  )

  return router
}
