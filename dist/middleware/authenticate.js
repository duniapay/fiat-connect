"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siweAuthMiddleware = exports.getClientAuthMiddleware = void 0;
const types_1 = require("../types");
function doNothingMiddleware(_req, _res, next) {
    next();
}
function verifyClientKeyMiddleware(_req, _res, _next) {
    // could be something like `if (req.headers.authorization !== `Bearer ${EXPECTED_API_KEY}`) throw new UnauthorizedError(); next();
    throw new Error('verifyClientKeyMiddleware not implemented');
}
function getClientAuthMiddleware(authConfig) {
    switch (authConfig.clientAuthStrategy) {
        case types_1.ClientAuthStrategy.Optional:
            // Checks the authorization header for a client key, but does not require one; if present, validates that it's a recognized key.
            return [doNothingMiddleware];
        case types_1.ClientAuthStrategy.Required:
            // Requires that the authorization header contains a recognized client key.
            return [verifyClientKeyMiddleware];
        default:
            throw new Error(`Auth strategy does not have a handler defined: ${authConfig.clientAuthStrategy}`);
    }
}
exports.getClientAuthMiddleware = getClientAuthMiddleware;
function siweAuthMiddleware(req, _res, next) {
    if (!req.session.siwe) {
        throw new types_1.UnauthorizedError();
    }
    if (new Date() > new Date(req.session.siwe.expirationTime)) {
        throw new types_1.UnauthorizedError(types_1.FiatConnectError.SessionExpired);
    }
    next();
}
exports.siweAuthMiddleware = siweAuthMiddleware;
//# sourceMappingURL=authenticate.js.map