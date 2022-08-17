"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postFiatAccountRequestBodySchema = void 0;
const types_1 = require("../types");
const account_number_1 = require("./account-number");
const dunia_wallet_1 = require("./dunia-wallet");
const mobile_money_1 = require("./mobile-money");
exports.postFiatAccountRequestBodySchema = {
    $id: 'PostFiatAccountRequestBodySchema',
    type: 'object',
    properties: {
        fiatAccountSchema: {
            type: 'string',
            enum: [
                types_1.FiatAccountSchema.AccountNumber,
                types_1.FiatAccountSchema.DuniaWallet,
                types_1.FiatAccountSchema.MobileMoney,
            ],
        },
        data: {
            oneOf: [account_number_1.accountNumberSchema, dunia_wallet_1.duniaWalletSchema, mobile_money_1.mobileMoneySchema],
        },
    },
    required: ['fiatAccountSchema', 'data'],
};
//# sourceMappingURL=post-fiat-account-request-body.js.map