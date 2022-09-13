import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import { KycRequestParams, KycSchemas, SupportedKycSchemas } from '../types'
import { siweAuthMiddleware } from '../middleware/authenticate'
import { KYC } from '../entity/kyc.entity'
import {
  FiatConnectError,
  KycSchema,
  KycStatus,
} from '@fiatconnect/fiatconnect-types'

export function kycRouter({
  clientAuthMiddleware,
  dataSource,
}: {
  clientAuthMiddleware: express.RequestHandler[]
  dataSource: any
}): express.Router {
  const router = express.Router()

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
        // Delegate to type-specific handlers after validation provides type guards
        const formattedSchema = validateSchema<
          KycSchemas[typeof req.params.kycSchema]
        >(req.body, `${req.params.kycSchema}KycSchema`)
        /// TODO: Handle Geo
        try {
          // Load Repository
          const repository = dataSource.getRepository(KYC)
          const entity = new KYC()

          entity.address = formattedSchema?.address
          entity.dateOfBirth = formattedSchema?.dateOfBirth
          entity.firstName = formattedSchema?.firstName
          entity.lastName = formattedSchema?.lastName
          entity.middleName = formattedSchema?.middleName
          entity.phoneNumber = formattedSchema?.phoneNumber
          entity.selfieDocument = formattedSchema?.selfieDocument
          entity.identificationDocument =
            formattedSchema?.identificationDocument
          entity.kycSchemaName = KycSchema.PersonalDataAndDocuments
          entity.status = KycStatus.KycPending

          await repository.save(entity)
          return _res.send({ kycStatus: KycStatus.KycPending })
        } catch (error) {
          console.log(error)
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
          const formattedSchema = validateSchema<
            KycSchemas[typeof _req.params.kycSchema]
          >(_req.body, `${_req.params.kycSchema}KycSchema`)
          // Load Repository
          const repository = dataSource.getRepository(KYC)

          const result = await repository.findOneBy({
            firstName: formattedSchema.firstName,
            lastName: formattedSchema.lastName,
            dateOfBirth: formattedSchema.dateOfBirth,
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
        const formattedSchema = validateSchema<
          KycSchemas[typeof _req.params.kycSchema]
        >(_req.body, `${_req.params.kycSchema}KycSchema`)
        try {
          // Load Repository
          const repository = dataSource.getRepository(KYC)

          const toRemove = await repository.findOneBy({
            firstName: formattedSchema.firstName,
            lastName: formattedSchema.lastName,
            dateOfBirth: formattedSchema.dateOfBirth,
          })

          await repository.remove(toRemove)
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
