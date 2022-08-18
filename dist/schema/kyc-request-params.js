"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kycRequestParamsSchema = void 0;
const types_1 = require("../types");
exports.kycRequestParamsSchema = {
    $id: 'KycRequestParamsSchema',
    type: 'object',
    properties: {
        kycSchema: {
            type: 'string',
            enum: Object.values(types_1.KycSchema),
        },
    },
    required: ['kycSchema'],
};
//# sourceMappingURL=kyc-request-params.js.map