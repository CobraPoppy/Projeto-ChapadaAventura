import { Request, Response, NextFunction } from "express";
import { logger } from "../../../shared/logger";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error("unhandled_error", { error: err.message });
  res.status(500).json({ error: "Internal Server Error" });
}
