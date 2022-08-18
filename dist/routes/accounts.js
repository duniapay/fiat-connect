"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountsRouter = void 0;
const express_1 = __importDefault(require("express"));
const async_route_1 = require("./async-route");
const schema_1 = require("../schema/");
const types_1 = require("../types");
const authenticate_1 = require("../middleware/authenticate");
function accountsRouter({ clientAuthMiddleware, }) {
    const router = express_1.default.Router();
    router.use(authenticate_1.siweAuthMiddleware);
    router.use(clientAuthMiddleware);
    const postFiatAccountRequestBodyValidator = (req, _res, next) => {
        req.body = (0, schema_1.validateSchema)(req.body, 'PostFiatAccountRequestBodySchema');
        next();
    };
    const deleteFiatAccountRequestParamsValidator = (req, _res, next) => {
        req.params = (0, schema_1.validateSchema)(req.params, 'DeleteFiatAccountRequestParamsSchema');
        next();
    };
    router.post('/', postFiatAccountRequestBodyValidator, (0, async_route_1.asyncRoute)(async (req, _res) => {
        // Validate data in body for exact fiat account schema type. The body middleware
        // doesn't ensure exact match of fiatAccountSchema and data
        (0, schema_1.validateSchema)(req.body.data, `${req.body.fiatAccountSchema}Schema`);
        throw new types_1.NotImplementedError('POST /accounts/:fiatAccountSchema not implemented');
    }));
    router.get('/', (0, async_route_1.asyncRoute)(async (_req, _res) => {
        throw new types_1.NotImplementedError('GET /accounts not implemented');
    }));
    router.delete('/:fiatAccountId', deleteFiatAccountRequestParamsValidator, (0, async_route_1.asyncRoute)(async (_req, _res) => {
        throw new types_1.NotImplementedError('DELETE /accounts/:fiatAccountId not implemented');
    }));
    return router;
}
exports.accountsRouter = accountsRouter;
//# sourceMappingURL=accounts.js.map