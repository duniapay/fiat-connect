import express from 'express'
import { Repository } from 'typeorm'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import { KycRequestParams, KycSchemas, SupportedKycSchemas } from '../types'
import { siweAuthMiddleware } from '../middleware/authenticate'
import { KYC } from '../entity/kyc.entity'
import {
  FiatConnectError,
  KycSchema,
  KycStatus,
  WebhookEventType,
  WebhookRequestBody,
} from '@fiatconnect/fiatconnect-types'
import { notifyPartner } from './webhook'
import { v4 as uuidv4 } from 'uuid'

export function kycRouter({
  clientAuthMiddleware,
  dataSource,
}: {
  clientAuthMiddleware: express.RequestHandler[]
  dataSource: any
}): express.Router {
  const router = express.Router()
  /// Load repository
  const repository = dataSource.getRepository(KYC)

  router.use(siweAuthMiddleware)
  router.use(clientAuthMiddleware)

  const kycSchemaRequestParamsValidator = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.params = validateSchema<KycRequestParams>(
      req.params,
      'KycRequestParamsSchema',
    )
    next()
  }

  router.post(
    '/:kycSchema',
    kycSchemaRequestParamsValidator,
    asyncRoute(
      async (
        req: express.Request<
          KycRequestParams,
          {},
          KycSchemas[SupportedKycSchemas]
        >,
        _res: express.Response,
      ) => {
        const userAddress = req.session.siwe?.address

        // Delegate to type-specific handlers after validation provides type guards
        const formattedSchema = validateSchema<
          KycSchemas[typeof req.params.kycSchema]
        >(req.body, `${req.params.kycSchema}KycSchema`)
        try {
          // Load Repository
          const entity = new KYC()

          entity.address = formattedSchema?.address
          entity.dateOfBirth = formattedSchema?.dateOfBirth
          entity.firstName = formattedSchema?.firstName
          entity.owner = userAddress!
          entity.lastName = formattedSchema?.lastName
          entity.middleName = formattedSchema?.middleName
          entity.phoneNumber = formattedSchema?.phoneNumber
          entity.selfieDocument = formattedSchema?.selfieDocument
          entity.identificationDocument =
            formattedSchema?.identificationDocument
          entity.kycSchemaName = KycSchema.PersonalDataAndDocuments
          entity.status = KycStatus.KycPending

          await repository.save(entity)

          const d: WebhookRequestBody<WebhookEventType.KycStatusEvent> = {
            eventType: WebhookEventType.KycStatusEvent,
            provider: 'dunia-payment',
            eventId: uuidv4(),
            timestamp: Date.now().toString(),
            address: entity.owner,
            payload: {
              kycSchema: entity.kycSchemaName,
              kycStatus: entity.status,
            },
          }
          const webhookSecret = process.env.WEBHOOK_SECRET!
          //await notifyPartner(d, webhookSecret)
          return _res.send({ kycStatus: KycStatus.KycPending })
        } catch (error) {
          return _res
            .status(409)
            .send({ error: FiatConnectError.ResourceExists })
        }
      },
    ),
  )

  router.get(
    '/:kycSchema/status',
    kycSchemaRequestParamsValidator,
    asyncRoute(
      async (
        _req: express.Request<KycRequestParams>,
        _res: express.Response,
      ) => {
        try {
          // Load Repository
          const repository: Repository<KYC> = dataSource.getRepository(KYC)
          const userAddress = _req.session.siwe?.address
          let result
          if (userAddress !== undefined)
            result = await repository.findOne({
              where: {
                kycSchemaName: _req.params.kycSchema,
                owner: userAddress,
              },
            })

          return _res.send({ status: result?.status })
        } catch (error) {
          return _res
            .status(404)
            .send({ error: FiatConnectError.ResourceNotFound })
        }
      },
    ),
  )

  router.delete(
    '/:kycSchema',
    kycSchemaRequestParamsValidator,
    asyncRoute(
      async (
        _req: express.Request<KycRequestParams>,
        _res: express.Response,
      ) => {
        try {
          // Load Repository

          const userAddress = _req.session.siwe?.address
          let result
          if (userAddress !== undefined)
            result = await repository.findOne({
              where: {
                kycSchemaName: _req.params.kycSchema,
                owner: userAddress,
              },
            })
          await repository.remove(result)
          return _res.status(200).send({})
        } catch (error) {
          return _res
            .status(404)
            .send({ error: FiatConnectError.ResourceNotFound })
        }
      },
    ),
  )

  return router
}
