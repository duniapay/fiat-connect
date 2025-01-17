import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import {
  DeleteFiatAccountRequestParams,
  FiatAccountSchemas,
  PostFiatAccountRequestBody,
  SupportedFiatAccountSchemas,
} from '../types'
import { siweAuthMiddleware } from '../middleware/authenticate'
import { Account } from '../entity/account.entity'
import {
  FiatAccountSchema,
  FiatAccountType,
  FiatConnectError,
} from '@fiatconnect/fiatconnect-types'
import { FindOptionsWhere, Repository } from 'typeorm'

export function accountsRouter({
  clientAuthMiddleware,
  dataSource,
}: {
  clientAuthMiddleware: express.RequestHandler[]
  dataSource: any
}): express.Router {
  const router = express.Router()

  router.use(siweAuthMiddleware)
  router.use(clientAuthMiddleware)

  const postFiatAccountRequestBodyValidator = (
    req: express.Request<
      {},
      {},
      PostFiatAccountRequestBody<SupportedFiatAccountSchemas>
    >,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.body = validateSchema<
      PostFiatAccountRequestBody<SupportedFiatAccountSchemas>
    >(req.body, 'PostFiatAccountRequestBodySchema')
    next()
  }

  const deleteFiatAccountRequestParamsValidator = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.params = validateSchema<DeleteFiatAccountRequestParams>(
      req.params,
      'DeleteFiatAccountRequestParamsSchema',
    )
    next()
  }

  router.post(
    '/',
    postFiatAccountRequestBodyValidator,
    asyncRoute(
      async (
        req: express.Request<
          {},
          {},
          PostFiatAccountRequestBody<SupportedFiatAccountSchemas>
        >,
        _res: express.Response,
      ) => {
        let userAddress = ''
        if (
          req.session.siwe?.address !== undefined &&
          req.session.siwe.address !== null
        ) {
          userAddress = req.session.siwe?.address
        }

        // Validate data in body for exact fiat account schema type. The body middleware
        // doesn't ensure exact match of fiatAccountSchema and data
        const entity = new Account()
        entity.fiatAccountSchema = req.body.fiatAccountSchema
        entity.owner = userAddress

        switch (req.body.fiatAccountSchema) {
          case 'AccountNumber':
            const accountNumberAccount = validateSchema<
              FiatAccountSchemas[typeof req.body.fiatAccountSchema]
            >(req.body.data, `${req.body.fiatAccountSchema}Schema`)
            entity.institutionName = accountNumberAccount.institutionName
            entity.accountName = accountNumberAccount?.accountName
            entity.fiatAccountType = accountNumberAccount?.fiatAccountType
            entity.country = accountNumberAccount?.country
            entity.accountNumber = accountNumberAccount?.accountNumber
            break
          case 'DuniaWallet':
            const data = validateSchema<
              FiatAccountSchemas[typeof req.body.fiatAccountSchema]
            >(req.body.data, `${req.body.fiatAccountSchema}Schema`)
            entity.institutionName = data.institutionName
            entity.accountName = data?.accountName
            entity.fiatAccountType = data?.fiatAccountType
            entity.mobile = data?.mobile
            break
          case 'MobileMoney':
            const momoAccount = validateSchema<
              FiatAccountSchemas[typeof req.body.fiatAccountSchema]
            >(req.body.data, `${req.body.fiatAccountSchema}Schema`)
            entity.institutionName = momoAccount.institutionName
            entity.accountName = momoAccount?.accountName
            entity.fiatAccountType = momoAccount?.fiatAccountType
            entity.country = momoAccount?.country
            entity.mobile = momoAccount?.mobile
            entity.operator = momoAccount?.operator
            break
          default:
            break
        }

        try {
          // Load Repository
          const repository = dataSource.getRepository(Account)
          await repository.save(entity)

          return _res.send({
            fiatAccountId: entity.id,
            accountName: entity.accountName,
            institutionName: entity.institutionName,
            fiatAccountType: entity.fiatAccountType,
            fiatAccountSchema: req.body.fiatAccountSchema
          })
        } catch (error) {
          return _res
            .status(409)
            .send({ error: FiatConnectError.ResourceExists })
        }
      },
    ),
  )

  router.get(
    '/',
    asyncRoute(async (_req: express.Request, _res: express.Response) => {
      try {
        const userAddress = _req.session.siwe?.address
        // Load Repository
        const repository: Repository<Account> =
          dataSource.getRepository(Account)

        const entity = await repository.findBy({
          owner: userAddress,
        })
        const bankAccounts = entity.filter(
          (account) => account.fiatAccountType === FiatAccountType.BankAccount,
        )
        const momoAccounts = entity.filter(
          (account) => account.fiatAccountType === FiatAccountType.MobileMoney,
        )

        const walletAccounts = entity.filter(
          (account) => account.fiatAccountType === FiatAccountType.DuniaWallet,
        )

        let formattedBankAccounts: any[] = []
        let formattedMomoAccounts: any[] = []
        let formattedWalletAccounts: any[] = []

        bankAccounts.forEach((account) => {
          const add = {
            fiatAccountType: account.fiatAccountType,
            fiatAccountId: account.id,
            fiatAccountSchema: account.fiatAccountSchema,
            accountName: account.accountName,
            institutionName: account.institutionName
          }
          formattedBankAccounts.push(add)
        })

        momoAccounts.forEach((account) => {
          const add = {
            fiatAccountType: account.fiatAccountType,
            fiatAccountId: account.id,
            fiatAccountSchema: account.fiatAccountSchema,
            accountName: account.accountName,
            institutionName: account.institutionName,
            operator: account?.operator,
            country: account?.country,
            mobile: account?.mobile,
          }
          formattedMomoAccounts.push(add)
        })
        walletAccounts.forEach((account) => {
          const add = {
            fiatAccountType: account.fiatAccountType,
            fiatAccountId: account.id,
            fiatAccountSchema: account.fiatAccountSchema,
            accountName: account.accountName,
            institutionName: account.institutionName,
            country: account?.country,
            mobile: account?.mobile,
          }
          formattedWalletAccounts.push(add)
        })
        let resp
        if (
          formattedBankAccounts.length === 0 &&
          formattedWalletAccounts.length === 0 &&
          formattedMomoAccounts.length === 0
        ) {
          resp = {}
        } else {
          resp = {
            [FiatAccountType.BankAccount]: formattedBankAccounts,
            [FiatAccountType.MobileMoney]: formattedMomoAccounts,
            [FiatAccountType.DuniaWallet]: formattedWalletAccounts,
          }
        }
        return _res.status(200).send(resp)
      } catch (error) {
        return _res
          .status(404)
          .send({ error: FiatConnectError.ResourceNotFound })
      }
    }),
  )

  router.delete(
    '/:fiatAccountId',
    deleteFiatAccountRequestParamsValidator,
    asyncRoute(
      async (
        _req: express.Request<DeleteFiatAccountRequestParams>,
        _res: express.Response,
      ) => {
        const userAddress = _req.session.siwe?.address

        try {
          // Load Repository
          const repository = dataSource.getRepository(Account)

          const toRemove = await repository.findOneBy({
            id: _req.body.fiatAccountId,
            owner: userAddress,
          })

          await repository.remove(toRemove)
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
