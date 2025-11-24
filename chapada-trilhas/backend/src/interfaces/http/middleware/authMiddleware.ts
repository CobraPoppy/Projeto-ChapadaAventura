import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../../infra/security/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string };
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const [, token] = authHeader.split(" ");
  if (!token) return next();

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
  } catch {
    // token inválido -> ignora (rota pode exigir auth via AOP)
  }

  next();
}
