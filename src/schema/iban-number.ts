import { JSONSchemaType } from 'ajv'
import {
  FiatAccountSchema,
  FiatAccountSchemas,
  FiatAccountType,
} from '../types'

export const ibanNumberSchema: JSONSchemaType<
  FiatAccountSchemas[FiatAccountSchema.IBANNumber]
> = {
  $id: 'IBANNumberSchema',
  type: 'object',
  properties: {
    institutionName: {
      type: 'string',
    },
    accountName: {
      type: 'string',
    },
    iban: {
      type: 'string',
    },
    fiatAccountType: {
      type: 'string',
      enum: [FiatAccountType.BankAccount],
    },
    country: {
      type: 'string',
    },
  },
  required: [
    'institutionName',
    'iban',
    'accountName',
    'country',
    'fiatAccountType',
  ],
}
