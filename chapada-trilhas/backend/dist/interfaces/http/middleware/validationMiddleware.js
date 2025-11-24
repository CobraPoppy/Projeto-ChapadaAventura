"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationMiddleware = createValidationMiddleware;
function createValidationMiddleware(validator) {
    return (req, res, next) => {
        try {
            validator(req);
            next();
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
}
