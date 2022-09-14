import { JSONSchemaType } from 'ajv'
import {
  FiatAccountSchema,
  PostFiatAccountRequestBody,
  SupportedFiatAccountSchemas,
} from '../types'
import { duniaWalletSchema } from './dunia-wallet'
import { mobileMoneySchema } from './mobile-money'
import { accountNumberSchema } from './account-number'

export const postFiatAccountRequestBodySchema: JSONSchemaType<
  PostFiatAccountRequestBody<SupportedFiatAccountSchemas>
> = {
  $id: 'PostFiatAccountRequestBodySchema',
  type: 'object',
  properties: {
    fiatAccountSchema: {
      type: 'string',
      enum: [
        FiatAccountSchema.AccountNumber,
        FiatAccountSchema.DuniaWallet,
        FiatAccountSchema.MobileMoney,
      ],
    },
    data: {
      oneOf: [accountNumberSchema, duniaWalletSchema, mobileMoneySchema],
    },
  },
  required: ['fiatAccountSchema', 'data'],
}
