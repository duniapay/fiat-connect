"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequestBodySchema = void 0;
exports.authRequestBodySchema = {
    $id: 'AuthRequestBodySchema',
    type: 'object',
    properties: {
        message: {
            type: 'string',
        },
        signature: {
            type: 'string',
        },
    },
    required: ['message', 'signature'],
};
//# sourceMappingURL=auth-request-body.js.map