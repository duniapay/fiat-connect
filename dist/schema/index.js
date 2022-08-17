"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = void 0;
const ajv_1 = __importDefault(require("ajv"));
const types_1 = require("../types");
const quote_request_body_1 = require("./quote-request-body");
const kyc_request_params_1 = require("./kyc-request-params");
const personal_data_and_documents_kyc_1 = require("./personal-data-and-documents-kyc");
const post_fiat_account_request_body_1 = require("./post-fiat-account-request-body");
const delete_fiat_account_request_params_1 = require("./delete-fiat-account-request-params");
const transfer_request_body_1 = require("./transfer-request-body");
const transfer_status_request_params_1 = require("./transfer-status-request-params");
const auth_request_body_1 = require("./auth-request-body");
const ajv = new ajv_1.default({
    schemas: [
        quote_request_body_1.quoteRequestBodySchema,
        kyc_request_params_1.kycRequestParamsSchema,
        personal_data_and_documents_kyc_1.personalDataAndDocumentsKycSchema,
        post_fiat_account_request_body_1.postFiatAccountRequestBodySchema,
        delete_fiat_account_request_params_1.deleteFiatAccountRequestParamsSchema,
        transfer_request_body_1.transferRequestBodySchema,
        transfer_status_request_params_1.transferStatusRequestParamsSchema,
        auth_request_body_1.authRequestBodySchema,
    ],
});
function validateSchema(data, schema) {
    if (ajv.validate(schema, data))
        return data;
    throw new types_1.ValidationError(`Error while validating schema: invalid ${schema}`, ajv.errors);
}
exports.validateSchema = validateSchema;
//# sourceMappingURL=index.js.map