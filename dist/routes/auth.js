"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const siwe_1 = require("siwe");
const schema_1 = require("../schema");
const types_1 = require("../types");
const async_route_1 = require("./async-route");
const MAX_EXPIRATION_TIME_MS = 4 * 60 * 60 * 1000; // 4 hours
const VERSION = '1';
async function validateNonce(_nonce, _redisClient) {
    // must validate that the nonce hasn't already been used. Could typically be
    // done by saving nonces in a store with TTL (like redis) and check if the
    // nonce is already used. If a nonce is already used, must throw a NonceInUse
    // error. e.g. `throw new InvalidSiweParamsError(FiatConnectError.NonceInUser)`
    try {
        const nonceInUse = await _redisClient.get(_nonce);
        if (nonceInUse) {
            throw new types_1.InvalidSiweParamsError(types_1.FiatConnectError.NonceInUse);
        }
        await markNonceAsUsed(_nonce, new Date(), _redisClient);
    }
    catch (error) {
        throw new types_1.NotImplementedError(`validateNonce error ${error}`);
    }
}
async function markNonceAsUsed(_nonce, _expirationTime, _redisClient) {
    // helper method for storing nonces, which can then be used by the above method.
    try {
        await _redisClient.set(_nonce, _expirationTime.toISOString(), {
            EX: parseInt(_expirationTime.toUTCString()),
        });
    }
    catch (error) {
        throw new types_1.NotImplementedError(`markNonceAsUsed error ${error}`);
    }
}
function validateIssuedAtAndExpirationTime(issuedAt, expirationTime) {
    if (!expirationTime) {
        throw new types_1.InvalidSiweParamsError(types_1.FiatConnectError.InvalidParameters, 'Missing ExpirationTime');
    }
    const issuedAtDate = new Date(issuedAt);
    const expirationDate = new Date(expirationTime);
    const now = new Date();
    if (issuedAtDate > now) {
        throw new types_1.InvalidSiweParamsError(types_1.FiatConnectError.IssuedTooEarly);
    }
    if (expirationDate < now) {
        throw new types_1.InvalidSiweParamsError(types_1.FiatConnectError.InvalidParameters, 'ExpirationTime is in the past');
    }
    if (expirationDate < issuedAtDate) {
        throw new types_1.InvalidSiweParamsError(types_1.FiatConnectError.InvalidParameters, 'ExpirationTime is before IssuedAt');
    }
    if (expirationDate.getTime() - issuedAtDate.getTime() >
        MAX_EXPIRATION_TIME_MS) {
        throw new types_1.InvalidSiweParamsError(types_1.FiatConnectError.ExpirationTooLong);
    }
}
function validateDomainAndUri(_domain, _uri) {
    return _domain === 'dunia.africa' && _uri === '/auth/login';
}
function authRouter({ chainId, client, }) {
    const router = express_1.default.Router();
    const authRequestBodyValidator = (req, _res, next) => {
        req.body = (0, schema_1.validateSchema)(req.body, 'AuthRequestBodySchema');
        next();
    };
    router.post('/login', authRequestBodyValidator, (0, async_route_1.asyncRoute)(async (req, res) => {
        let siweFields;
        try {
            const siweMessage = new siwe_1.SiweMessage(req.body.message);
            siweFields = await siweMessage.validate(req.body.signature);
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.warn(err);
            const errMessage = err.message;
            if (errMessage.includes(siwe_1.ErrorTypes.INVALID_SIGNATURE)) {
                throw new types_1.InvalidSiweParamsError(types_1.FiatConnectError.InvalidSignature);
            }
            else if (errMessage.includes(siwe_1.ErrorTypes.EXPIRED_MESSAGE)) {
                throw new types_1.InvalidSiweParamsError(types_1.FiatConnectError.InvalidParameters, 'Expired message');
            }
            throw new types_1.InvalidSiweParamsError(types_1.FiatConnectError.InvalidParameters, 'Invalid siwe message');
        }
        await client.connect();
        validateIssuedAtAndExpirationTime(siweFields.issuedAt, siweFields.expirationTime);
        await validateNonce(siweFields.nonce, client);
        validateDomainAndUri(siweFields.domain, siweFields.uri);
        if (siweFields.version !== VERSION) {
            throw new types_1.InvalidSiweParamsError(types_1.FiatConnectError.InvalidParameters, 'Invalid version');
        }
        if (siweFields.chainId !== chainId) {
            throw new types_1.InvalidSiweParamsError(types_1.FiatConnectError.InvalidParameters, 'Invalid chain ID');
        }
        const sessionExpirationTime = new Date(siweFields.expirationTime);
        await markNonceAsUsed(siweFields.nonce, sessionExpirationTime, client);
        req.session.siwe = siweFields;
        req.session.cookie.expires = sessionExpirationTime;
        res.status(200).end();
    }));
    return router;
}
exports.authRouter = authRouter;
//# sourceMappingURL=auth.js.map