/* eslint-disable max-classes-per-file*/
import {
  TransferRequestBody,
  TransferStatusRequestParams,
  QuoteRequestBody,
  KycRequestParams,
  KycSchema,
  KycSchemas,
  PostFiatAccountRequestBody,
  DeleteFiatAccountRequestParams,
  FiatAccountSchema,
  FiatAccountSchemas,
  SupportedOperatorEnum,
  FiatType,
  CryptoType,
  FiatAccountType,
  FiatConnectError,
  AuthRequestBody,
} from '@fiatconnect/fiatconnect-types'

export {
  TransferRequestBody,
  TransferStatusRequestParams,
  QuoteRequestBody,
  KycRequestParams,
  KycSchema,
  KycSchemas,
  PostFiatAccountRequestBody,
  DeleteFiatAccountRequestParams,
  FiatAccountSchema,
  FiatAccountSchemas,
  SupportedOperatorEnum,
  FiatType,
  FiatAccountType,
  CryptoType,
  FiatConnectError,
  AuthRequestBody,
}

/*
/ Configuration Types
*/

export interface Config {
  authConfig: AuthenticationConfig
  port: number
  sessionSecret: string
  openapiSpec: string
  coinMarketCapKey: string
  coinMarketCapUrl: string
}

export enum ClientAuthStrategy {
  Optional = 'Optional',
  Required = 'Required',
}

export interface AuthenticationConfig {
  clientAuthStrategy: ClientAuthStrategy
  network: Network
  web3ProviderUrl: string
  chainId: number
}
export interface WebhookEvent {
  event: KYC_EVENTS | TRANSFER_EVENTS
  data: any
  url: string
}

export enum KYC_EVENTS {
  created = 'created',
  updated = 'updated',
}

export enum TRANSFER_EVENTS {
  created = 'created',
  updated = 'updated',
}
export enum SUPPORTED_DOMAINS {
  STAGING = 'cico-staging.dunia.africa',
  PRODUCTION = 'cico.dunia.africa',
  DEVELOPMENT = 'localhost',
}

export enum SUPPORTED_URIS {
  STAGING = 'https://cico-staging.dunia.africa/auth/login',
  PRODUCTION = 'https://cico.dunia.africa/auth/login',
  DEVELOPMENT = 'http://localhost:8080/auth/login',
}

export enum Network {
  Alfajores = 'Alfajores',
  Mainnet = 'Mainnet',
}

/*
 * API error types
 */

export class ValidationError extends Error {
  validationError: any
  constructor(msg: string, validationError: any) {
    super(msg)
    Object.setPrototypeOf(this, new.target.prototype)
    this.validationError = validationError
  }
}

export class NotImplementedError extends Error {}

export class UnauthorizedError extends Error {
  fiatConnectError: FiatConnectError

  constructor(
    fiatConnectError: FiatConnectError = FiatConnectError.Unauthorized,
    msg?: string,
  ) {
    super(msg || fiatConnectError)
    Object.setPrototypeOf(this, new.target.prototype)
    this.fiatConnectError = fiatConnectError
  }
}

export class InvalidSiweParamsError extends Error {
  fiatConnectError: FiatConnectError

  constructor(fiatConnectError: FiatConnectError, msg?: string) {
    super(msg || fiatConnectError)
    Object.setPrototypeOf(this, new.target.prototype)
    this.fiatConnectError = fiatConnectError
  }
}

export type SupportedFiatAccountSchemas =
  | FiatAccountSchema.AccountNumber
  | FiatAccountSchema.DuniaWallet
  | FiatAccountSchema.MobileMoney

export type SupportedKycSchemas = KycSchema.PersonalDataAndDocuments
