import { Request } from "express";

export function validateCreateContact(req: Request) {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    throw new Error("Missing required fields");
  }
}
