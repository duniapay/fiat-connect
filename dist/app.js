"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApp = void 0;
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const quote_1 = require("./routes/quote");
const kyc_1 = require("./routes/kyc");
const accounts_1 = require("./routes/accounts");
const transfer_1 = require("./routes/transfer");
const error_1 = require("./middleware/error");
const auth_1 = require("./routes/auth");
function getSessionName() {
    // must return a name for the session cookie, typically the provider name
    return 'DUNIA PAYMENT';
}
function initApp({ clientAuthMiddleware, sessionSecret, chainId, client, }) {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get('/clock', (_req, _res) => {
        // NOTE: you *could* just use res.status(200).send({time: new Date().toISOFormat()}), BUT only if your server is single-node
        //  (otherwise you need session affinity or some way of guaranteeing consistency of the current time between nodes)
        return _res.status(200).send({ time: new Date().toUTCString() });
    });
    app.use(
    // https://www.npmjs.com/package/express-session-expire-timeout#sessionoptions
    (0, express_session_1.default)({
        name: getSessionName(),
        secret: sessionSecret,
        resave: true,
        saveUninitialized: true,
        cookie: { secure: true, sameSite: true },
    }));
    app.use('/auth', (0, auth_1.authRouter)({ chainId, client }));
    app.use('/quote', (0, quote_1.quoteRouter)({ clientAuthMiddleware }));
    app.use('/kyc', (0, kyc_1.kycRouter)({ clientAuthMiddleware }));
    app.use('/accounts', (0, accounts_1.accountsRouter)({ clientAuthMiddleware }));
    app.use('/transfer', (0, transfer_1.transferRouter)({ clientAuthMiddleware }));
    app.use(error_1.errorToStatusCode);
    return app;
}
exports.initApp = initApp;
//# sourceMappingURL=app.js.map