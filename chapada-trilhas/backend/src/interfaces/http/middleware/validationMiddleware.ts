import { Request, Response, NextFunction } from "express";

export function createValidationMiddleware(validator: (req: Request) => void) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      validator(req);
      next();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };
}
