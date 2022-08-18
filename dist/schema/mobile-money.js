"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileMoneySchema = void 0;
const types_1 = require("../types");
exports.mobileMoneySchema = {
    $id: 'MobileMoneySchema',
    type: 'object',
    properties: {
        institutionName: {
            type: 'string',
        },
        accountName: {
            type: 'string',
        },
        fiatAccountType: {
            type: 'string',
            enum: [types_1.FiatAccountType.MobileMoney],
        },
        mobile: {
            type: 'string',
        },
        operator: {
            type: 'string',
            enum: [
                types_1.SupportedOperatorEnum.MTN,
                types_1.SupportedOperatorEnum.ORANGE,
                types_1.SupportedOperatorEnum.MOOV,
                types_1.SupportedOperatorEnum.WAVE,
            ],
        },
        country: {
            type: 'string',
        },
    },
    required: [
        'institutionName',
        'accountName',
        'mobile',
        'operator',
        'country',
        'fiatAccountType',
    ],
};
//# sourceMappingURL=mobile-money.js.map