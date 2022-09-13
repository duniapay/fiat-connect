import { JSONSchemaType } from 'ajv'
import {
  FiatAccountSchema,
  PostFiatAccountRequestBody,
  SupportedFiatAccountSchemas,
} from '../types'
import { duniaWalletSchema } from './dunia-wallet'
import { mobileMoneySchema } from './mobile-money'
import { ibanNumberSchema } from './iban-number'

export const postFiatAccountRequestBodySchema: JSONSchemaType<
  PostFiatAccountRequestBody<SupportedFiatAccountSchemas>
> = {
  $id: 'PostFiatAccountRequestBodySchema',
  type: 'object',
  properties: {
    fiatAccountSchema: {
      type: 'string',
      enum: [
        FiatAccountSchema.IBANNumber,
        FiatAccountSchema.DuniaWallet,
        FiatAccountSchema.MobileMoney,
      ],
    },
    data: {
      oneOf: [ibanNumberSchema, duniaWalletSchema, mobileMoneySchema],
    },
  },
  required: ['fiatAccountSchema', 'data'],
}
