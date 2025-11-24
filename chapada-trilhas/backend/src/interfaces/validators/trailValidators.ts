import { Request } from "express";

export function validateCreateTrail(req: Request) {
  const { name, slug, description, difficulty, distanceKm, durationHours, price, category, location } = req.body;
  if (!name || !slug || !description || !difficulty || !distanceKm || !durationHours || !price || !category || !location) {
    throw new Error("Missing required fields");
  }
}

export function validateUpdateTrail(req: Request) {
  if (!req.params.id) throw new Error("Missing id param");
}
