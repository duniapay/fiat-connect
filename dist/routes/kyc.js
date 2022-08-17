"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kycRouter = void 0;
const express_1 = __importDefault(require("express"));
const async_route_1 = require("./async-route");
const schema_1 = require("../schema/");
const types_1 = require("../types");
const authenticate_1 = require("../middleware/authenticate");
function kycRouter({ clientAuthMiddleware, }) {
    const router = express_1.default.Router();
    router.use(authenticate_1.siweAuthMiddleware);
    router.use(clientAuthMiddleware);
    const kycSchemaRequestParamsValidator = (req, _res, next) => {
        req.params = (0, schema_1.validateSchema)(req.params, 'KycRequestParamsSchema');
        next();
    };
    router.post('/:kycSchema', kycSchemaRequestParamsValidator, (0, async_route_1.asyncRoute)(async (req, _res) => {
        // Delegate to type-specific handlers after validation provides type guards
        (0, schema_1.validateSchema)(req.body, `${req.params.kycSchema}KycSchema`);
        throw new types_1.NotImplementedError('POST /kyc/:kycSchema not implemented');
    }));
    router.get('/:kycSchema/status', kycSchemaRequestParamsValidator, (0, async_route_1.asyncRoute)(async (_req, _res) => {
        throw new types_1.NotImplementedError('GET /kyc/:kycSchema/status not implemented');
    }));
    router.delete('/:kycSchema', kycSchemaRequestParamsValidator, (0, async_route_1.asyncRoute)(async (_req, _res) => {
        throw new types_1.NotImplementedError('DELETE /kyc/:kycSchema not implemented');
    }));
    return router;
}
exports.kycRouter = kycRouter;
//# sourceMappingURL=kyc.js.map