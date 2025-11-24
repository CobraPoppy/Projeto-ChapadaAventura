"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../../../infra/security/jwt");
function authMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return next();
    const [, token] = authHeader.split(" ");
    if (!token)
        return next();
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = { id: payload.id, email: payload.email, role: payload.role };
    }
    catch {
        // token inválido -> ignora (rota pode exigir auth via AOP)
    }
    next();
}
