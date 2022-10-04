import {
  Config,
  ClientAuthStrategy,
  AuthenticationConfig,
  Network,
} from './types'
import * as dotenv from 'dotenv'
import yargs from 'yargs'
import path from 'path'
import { parse } from 'node:path/win32'

export const ALFAJORES_FORNO_URL = 'https://alfajores-forno.celo-testnet.org'
export const MAINNET_FORNO_URL = 'https://forno.celo.org'
const OPENAPI_SPEC = `../specification/swagger.yaml`

export const authConfigOptions: Record<string, AuthenticationConfig> = {
  alfajores: {
    web3ProviderUrl: ALFAJORES_FORNO_URL,
    network: Network.Alfajores,
    chainId: 44787,
    clientAuthStrategy: ClientAuthStrategy.Optional,
  },
  mainnet: {
    web3ProviderUrl: MAINNET_FORNO_URL,
    network: Network.Mainnet,
    chainId: 42220,
    clientAuthStrategy: ClientAuthStrategy.Required,
  },
}

export function loadConfig(): Config {
  // Note that this is just one possible way of dealing with configuration/environment variables.
  // Feel free to adapt this to your needs!
  dotenv.config()
  const DEFAULT_PORT =
    process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 8080

  const argv = yargs
    .env('')
    .option('auth-config-option', {
      description: 'Authentication strategy to use',
      example: 'mainnet',
      type: 'string',
      demandOption: true,
      choices: Object.keys(authConfigOptions),
    })
    .option('port', {
      description: 'Port to use for running the API',
      example: DEFAULT_PORT,
      type: 'number',
      default: DEFAULT_PORT,
    })
    .option('openapi-spec', {
      description: 'OpenAPI 2.0 specification file to test against',
      type: 'string',
      example: OPENAPI_SPEC,
      default: OPENAPI_SPEC,
    })
    .option('coin_market_cap_key', {
      description: '',
      type: 'string',
      example: '8e434527-ebeb-4233-98ba-1da2a675ebc5',
      default: '8e434527-ebeb-4233-98ba-1da2a675ebc5',
    })
    .option('coin_market_cap_url', {
      description: '',
      type: 'string',
      example: 'https://sandbox-api.coinmarketcap.com/v1',
      default: 'https://sandbox-api.coinmarketcap.com/v1',
    })
    .option('session-secret', {
      description: 'The secret for signing the session',
      type: 'string',
      demandOption: true,
    })
    .option('redis', {
      description: 'Redis server to connect',
      example: process.env.REDISCLOUD_URL,
      type: 'string',
      default:
        `redis://${process.env.REDISCLOUD_URL}` || `redis://localhost:6379`,
    })
    .parseSync()

  return {
    authConfig: authConfigOptions[argv['auth-config-option']],
    port: argv.port,
    sessionSecret: argv.sessionSecret,
    openapiSpec: argv.openapiSpec,
    coinMarketCapKey: argv.coin_market_cap_key!,
    coinMarketCapUrl: argv.coin_market_cap_url!,
  }
}
