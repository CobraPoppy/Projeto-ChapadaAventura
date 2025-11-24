"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAspects = withAspects;
const logger_1 = require("./logger");
function withAspects(handler, opts = {}) {
    return async (req, res, next) => {
        const start = Date.now();
        try {
            // Logging de entrada
            logger_1.logger.info("request_in", { path: req.path, method: req.method });
            // Validação
            if (opts.validate) {
                opts.validate(req);
            }
            // Autenticação / Autorização
            if (opts.requireAuth) {
                if (!req.user) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                if (req.user.role !== "admin") {
                    return res.status(403).json({ error: "Forbidden" });
                }
            }
            // Handler real
            await handler(req, res, next);
            // Auditoria simples
            if (opts.auditAction && req.user) {
                logger_1.logger.info("audit", {
                    userId: req.user.id,
                    action: opts.auditAction,
                    path: req.path,
                    method: req.method
                });
            }
            const duration = Date.now() - start;
            logger_1.logger.info("request_out", { path: req.path, method: req.method, duration });
        }
        catch (err) {
            logger_1.logger.error("request_error", { path: req.path, method: req.method, error: err.message });
            next(err);
        }
    };
}
