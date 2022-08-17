"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoteRequestBodySchema = void 0;
const types_1 = require("../types");
exports.quoteRequestBodySchema = {
    $id: 'QuoteRequestBodySchema',
    type: 'object',
    properties: {
        fiatType: {
            type: 'string',
            enum: Object.values(types_1.FiatType),
        },
        cryptoType: {
            type: 'string',
            enum: Object.values(types_1.CryptoType),
        },
        fiatAmount: {
            type: 'string',
            nullable: true,
        },
        cryptoAmount: {
            type: 'string',
            nullable: true,
        },
        country: {
            type: 'string',
        },
        region: {
            type: 'string',
            nullable: true,
        },
    },
    oneOf: [
        {
            required: ['fiatAmount'],
        },
        {
            required: ['cryptoAmount'],
        },
    ],
    required: ['fiatType', 'cryptoType', 'country'],
};
//# sourceMappingURL=quote-request-body.js.map