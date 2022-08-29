import {
  Config,
  ClientAuthStrategy,
  AuthenticationConfig,
  Network,
} from './types'
import * as dotenv from 'dotenv'
import yargs from 'yargs'
import path from 'path'

const DEFAULT_PORT = 8080
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
  // Redis Client From Configuration
  const redisClient: string =
    process.env.NODE_ENV === 'production'
      ? `redis://${process.env.REDISCLOUD_URL}`
      : `redis://localhost:6379`

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
    .option('session-secret', {
      description: 'The secret for signing the session',
      type: 'string',
      demandOption: true,
    })
    .option('redis', {
      description: 'Redis server to connect',
      example: process.env.REDISCLOUD_URL,
      type: 'string',
      default: `redis://${process.env.REDISCLOUD_URL}` || `redis://localhost:6379`,
    })
    .parseSync()

  return {
    authConfig: authConfigOptions[argv['auth-config-option']],
    port: argv.port,
    sessionSecret: argv.sessionSecret,
    redisClientHostUrl: redisClient,
    openapiSpec: argv.openapiSpec,
  }
}
