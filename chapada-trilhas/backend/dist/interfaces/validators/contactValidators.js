"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateContact = validateCreateContact;
function validateCreateContact(req) {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        throw new Error("Missing required fields");
    }
}
