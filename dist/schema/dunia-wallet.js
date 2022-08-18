"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duniaWalletSchema = void 0;
const types_1 = require("../types");
exports.duniaWalletSchema = {
    $id: 'DuniaWalletSchema',
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
            enum: [types_1.FiatAccountType.DuniaWallet],
        },
        mobile: {
            type: 'string',
        },
    },
    required: ['institutionName', 'accountName', 'mobile', 'fiatAccountType'],
};
//# sourceMappingURL=dunia-wallet.js.map