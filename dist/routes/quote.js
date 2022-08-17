"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoteRouter = void 0;
const express_1 = __importDefault(require("express"));
const async_route_1 = require("./async-route");
const schema_1 = require("../schema/");
const types_1 = require("../types");
function quoteRouter({ clientAuthMiddleware, }) {
    const router = express_1.default.Router();
    router.use(clientAuthMiddleware);
    router.use((req, _res, next) => {
        req.body = (0, schema_1.validateSchema)(req.body, 'QuoteRequestBodySchema');
        next();
    });
    router.post('/in', (0, async_route_1.asyncRoute)(async (_req, _res) => {
        throw new types_1.NotImplementedError('POST /quote/in not implemented');
    }));
    router.post('/out', (0, async_route_1.asyncRoute)(async (_req, _res) => {
        throw new types_1.NotImplementedError('POST /quote/out not implemented');
    }));
    return router;
}
exports.quoteRouter = quoteRouter;
//# sourceMappingURL=quote.js.map