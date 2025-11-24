import { Request, Response, NextFunction, RequestHandler } from "express";
import { logger } from "./logger";

type AspectOptions = {
  requireAuth?: boolean;
  validate?: (req: Request) => void;
  auditAction?: string;
};

export function withAspects(handler: RequestHandler, opts: AspectOptions = {}): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    try {
      // Logging de entrada
      logger.info("request_in", { path: req.path, method: req.method });

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
        logger.info("audit", {
          userId: req.user.id,
          action: opts.auditAction,
          path: req.path,
          method: req.method
        });
      }

      const duration = Date.now() - start;
      logger.info("request_out", { path: req.path, method: req.method, duration });
    } catch (err: any) {
      logger.error("request_error", { path: req.path, method: req.method, error: err.message });
      next(err);
    }
  };
}
