"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = exports.authConfigOptions = exports.MAINNET_FORNO_URL = exports.ALFAJORES_FORNO_URL = void 0;
const types_1 = require("./types");
const dotenv = __importStar(require("dotenv"));
const yargs_1 = __importDefault(require("yargs"));
const DEFAULT_PORT = 8080;
exports.ALFAJORES_FORNO_URL = 'https://alfajores-forno.celo-testnet.org';
exports.MAINNET_FORNO_URL = 'https://forno.celo.org';
exports.authConfigOptions = {
    alfajores: {
        web3ProviderUrl: exports.ALFAJORES_FORNO_URL,
        network: types_1.Network.Alfajores,
        chainId: 44787,
        clientAuthStrategy: types_1.ClientAuthStrategy.Optional,
    },
    mainnet: {
        web3ProviderUrl: exports.MAINNET_FORNO_URL,
        network: types_1.Network.Mainnet,
        chainId: 42220,
        clientAuthStrategy: types_1.ClientAuthStrategy.Required,
    },
};
function loadConfig() {
    // Note that this is just one possible way of dealing with configuration/environment variables.
    // Feel free to adapt this to your needs!
    dotenv.config();
    const argv = yargs_1.default
        .env('')
        .option('auth-config-option', {
        description: 'Authentication strategy to use',
        example: 'mainnet',
        type: 'string',
        demandOption: true,
        choices: Object.keys(exports.authConfigOptions),
    })
        .option('port', {
        description: 'Port to use for running the API',
        example: DEFAULT_PORT,
        type: 'number',
        default: DEFAULT_PORT,
    })
        .option('session-secret', {
        description: 'The secret for signing the session',
        type: 'string',
        demandOption: true,
    })
        .option('redis', {
        description: 'Redis server to connect',
        example: process.env.REDIS_HOST,
        type: 'string',
        default: `redis://${process.env.REDIS_HOST}` || `redis://localhost:6379`,
    })
        .parseSync();
    return {
        authConfig: exports.authConfigOptions[argv['auth-config-option']],
        port: argv.port,
        sessionSecret: argv.sessionSecret,
        redis: argv.redis,
    };
}
exports.loadConfig = loadConfig;
//# sourceMappingURL=config.js.map