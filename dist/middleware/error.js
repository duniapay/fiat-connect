"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorToStatusCode = void 0;
const types_1 = require("../types");
const errorToStatusCode = (error, _, res, next) => {
    if (error instanceof types_1.ValidationError) {
        res.status(400).json({
            error: error.message,
            data: error.validationError,
        });
    }
    else if (error instanceof types_1.UnauthorizedError ||
        error instanceof types_1.InvalidSiweParamsError) {
        res.status(401).json({
            error: error.fiatConnectError,
        });
    }
    else {
        next(error);
    }
};
exports.errorToStatusCode = errorToStatusCode;
//# sourceMappingURL=error.js.map