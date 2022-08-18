"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncRoute = void 0;
function asyncRoute(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}
exports.asyncRoute = asyncRoute;
//# sourceMappingURL=async-route.js.map