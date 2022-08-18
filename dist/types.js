"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidSiweParamsError = exports.UnauthorizedError = exports.NotImplementedError = exports.ValidationError = exports.Network = exports.ClientAuthStrategy = exports.FiatConnectError = exports.CryptoType = exports.FiatAccountType = exports.FiatType = exports.SupportedOperatorEnum = exports.FiatAccountSchema = exports.KycSchema = void 0;
/* eslint-disable max-classes-per-file*/
const fiatconnect_types_1 = require("@fiatconnect/fiatconnect-types");
Object.defineProperty(exports, "KycSchema", { enumerable: true, get: function () { return fiatconnect_types_1.KycSchema; } });
Object.defineProperty(exports, "FiatAccountSchema", { enumerable: true, get: function () { return fiatconnect_types_1.FiatAccountSchema; } });
Object.defineProperty(exports, "SupportedOperatorEnum", { enumerable: true, get: function () { return fiatconnect_types_1.SupportedOperatorEnum; } });
Object.defineProperty(exports, "FiatType", { enumerable: true, get: function () { return fiatconnect_types_1.FiatType; } });
Object.defineProperty(exports, "CryptoType", { enumerable: true, get: function () { return fiatconnect_types_1.CryptoType; } });
Object.defineProperty(exports, "FiatAccountType", { enumerable: true, get: function () { return fiatconnect_types_1.FiatAccountType; } });
Object.defineProperty(exports, "FiatConnectError", { enumerable: true, get: function () { return fiatconnect_types_1.FiatConnectError; } });
var ClientAuthStrategy;
(function (ClientAuthStrategy) {
    ClientAuthStrategy["Optional"] = "Optional";
    ClientAuthStrategy["Required"] = "Required";
})(ClientAuthStrategy = exports.ClientAuthStrategy || (exports.ClientAuthStrategy = {}));
var Network;
(function (Network) {
    Network["Alfajores"] = "Alfajores";
    Network["Mainnet"] = "Mainnet";
})(Network = exports.Network || (exports.Network = {}));
/*
 * API error types
 */
class ValidationError extends Error {
    constructor(msg, validationError) {
        super(msg);
        this.validationError = validationError;
    }
}
exports.ValidationError = ValidationError;
class NotImplementedError extends Error {
}
exports.NotImplementedError = NotImplementedError;
class UnauthorizedError extends Error {
    constructor(fiatConnectError = fiatconnect_types_1.FiatConnectError.Unauthorized, msg) {
        super(msg || fiatConnectError);
        this.fiatConnectError = fiatConnectError;
    }
}
exports.UnauthorizedError = UnauthorizedError;
class InvalidSiweParamsError extends Error {
    constructor(fiatConnectError, msg) {
        super(msg || fiatConnectError);
        this.fiatConnectError = fiatConnectError;
    }
}
exports.InvalidSiweParamsError = InvalidSiweParamsError;
//# sourceMappingURL=types.js.map