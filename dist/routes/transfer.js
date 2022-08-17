"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferRouter = void 0;
const express_1 = __importDefault(require("express"));
const async_route_1 = require("./async-route");
const schema_1 = require("../schema/");
const types_1 = require("../types");
const authenticate_1 = require("../middleware/authenticate");
function transferRouter({ clientAuthMiddleware, }) {
    const router = express_1.default.Router();
    router.use(authenticate_1.siweAuthMiddleware);
    router.use(clientAuthMiddleware);
    const transferRequestBodyValidator = (req, _res, next) => {
        req.body = (0, schema_1.validateSchema)(req.body, 'TransferRequestBodySchema');
        next();
    };
    const transferStatusRequestParamsValidator = (req, _res, next) => {
        req.params = (0, schema_1.validateSchema)(req.params, 'TransferStatusRequestParamsSchema');
        next();
    };
    router.post('/in', transferRequestBodyValidator, (0, async_route_1.asyncRoute)(async (_req, _res) => {
        throw new types_1.NotImplementedError('POST /transfer/in not implemented');
    }));
    router.post('/out', transferRequestBodyValidator, (0, async_route_1.asyncRoute)(async (_req, _res) => {
        throw new types_1.NotImplementedError('POST /transfer/out not implemented');
    }));
    router.get('/:transferId/status', transferStatusRequestParamsValidator, (0, async_route_1.asyncRoute)(async (_req, _res) => {
        throw new types_1.NotImplementedError('GET /transfer/:transferId/status not implemented');
    }));
    return router;
}
exports.transferRouter = transferRouter;
//# sourceMappingURL=transfer.js.map