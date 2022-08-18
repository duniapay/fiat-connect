"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authenticate_1 = require("./authenticate");
const types_1 = require("../types");
const express_response_1 = require("../mocks/express-response");
const siwe_1 = require("siwe");
describe('Authentication', () => {
    describe('Auth Middleware', () => {
        describe('siweAuthMiddleware', () => {
            it('throws if session is not set', () => {
                const req = {
                    session: {
                        id: 'sessionid',
                        cookie: {
                            originalMaxAge: 1,
                        },
                        regenerate: jest.fn(),
                        destroy: jest.fn(),
                        reload: jest.fn(),
                        resetMaxAge: jest.fn(),
                        save: jest.fn(),
                        touch: jest.fn(),
                    },
                };
                const next = jest.fn();
                const res = (0, express_response_1.getMockResponse)();
                expect(() => {
                    (0, authenticate_1.siweAuthMiddleware)(req, res, next);
                }).toThrow(new types_1.UnauthorizedError());
                expect(next).not.toHaveBeenCalled();
            });
            it('throws if session is expired', () => {
                const req = {
                    session: {
                        id: 'sessionid',
                        cookie: {
                            originalMaxAge: 1,
                        },
                        regenerate: jest.fn(),
                        destroy: jest.fn(),
                        reload: jest.fn(),
                        resetMaxAge: jest.fn(),
                        save: jest.fn(),
                        touch: jest.fn(),
                        siwe: new siwe_1.SiweMessage({
                            expirationTime: '2022-04-22T02:13:00Z',
                        }),
                    },
                };
                const next = jest.fn();
                const res = (0, express_response_1.getMockResponse)();
                expect(() => {
                    (0, authenticate_1.siweAuthMiddleware)(req, res, next);
                }).toThrow(new types_1.UnauthorizedError(types_1.FiatConnectError.SessionExpired));
                expect(next).not.toHaveBeenCalled();
            });
            it('passes if session is valid', () => {
                const futureDate = new Date(Date.now() + 60000);
                const req = {
                    session: {
                        id: 'sessionid',
                        cookie: {
                            originalMaxAge: 1,
                        },
                        regenerate: jest.fn(),
                        destroy: jest.fn(),
                        reload: jest.fn(),
                        resetMaxAge: jest.fn(),
                        save: jest.fn(),
                        touch: jest.fn(),
                        siwe: new siwe_1.SiweMessage({
                            expirationTime: futureDate.toISOString(),
                        }),
                    },
                };
                const next = jest.fn();
                const res = (0, express_response_1.getMockResponse)();
                (0, authenticate_1.siweAuthMiddleware)(req, res, next);
                expect(next).toHaveBeenCalled();
            });
        });
    });
});
//# sourceMappingURL=authenticate.test.js.map