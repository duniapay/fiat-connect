"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountNumberSchema = void 0;
const types_1 = require("../types");
exports.accountNumberSchema = {
    $id: 'AccountNumberSchema',
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
            enum: [types_1.FiatAccountType.BankAccount],
        },
        accountNumber: {
            type: 'string',
        },
        country: {
            type: 'string',
        },
    },
    required: [
        'institutionName',
        'accountName',
        'accountNumber',
        'country',
        'fiatAccountType',
    ],
};
//# sourceMappingURL=account-number.js.map