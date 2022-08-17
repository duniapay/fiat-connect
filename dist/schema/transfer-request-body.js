"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferRequestBodySchema = void 0;
exports.transferRequestBodySchema = {
    $id: 'TransferRequestBodySchema',
    type: 'object',
    properties: {
        fiatAccountId: {
            type: 'string',
        },
        quoteId: {
            type: 'string',
        },
    },
    required: ['fiatAccountId', 'quoteId'],
};
//# sourceMappingURL=transfer-request-body.js.map