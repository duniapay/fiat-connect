"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockResponse = void 0;
function getMockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}
exports.getMockResponse = getMockResponse;
//# sourceMappingURL=express-response.js.map