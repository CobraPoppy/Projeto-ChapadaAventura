"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateTrail = validateCreateTrail;
exports.validateUpdateTrail = validateUpdateTrail;
function validateCreateTrail(req) {
    const { name, slug, description, difficulty, distanceKm, durationHours, price, category, location } = req.body;
    if (!name || !slug || !description || !difficulty || !distanceKm || !durationHours || !price || !category || !location) {
        throw new Error("Missing required fields");
    }
}
function validateUpdateTrail(req) {
    if (!req.params.id)
        throw new Error("Missing id param");
}
