"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const authenticate_1 = require("./middleware/authenticate");
const app_1 = require("./app");
const redis_1 = require("redis");
async function main() {
    const { port, authConfig, sessionSecret, redis } = (0, config_1.loadConfig)();
    const clientAuthMiddleware = (0, authenticate_1.getClientAuthMiddleware)(authConfig);
    console.log(redis);
    const client = (0, redis_1.createClient)({ url: redis });
    await client.connect();
    const app = (0, app_1.initApp)({
        clientAuthMiddleware,
        sessionSecret,
        chainId: authConfig.chainId,
        client,
    });
    app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`Listening on http://localhost:${port}`);
        client.on('connect', function () {
            console.log('Connected to redis successfully');
        });
        client.on('error', function (err) {
            console.log('Could not establish a connection with redis. ' + err);
        });
    });
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map