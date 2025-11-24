"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../../../shared/logger");
function errorHandler(err, _req, res, _next) {
    logger_1.logger.error("unhandled_error", { error: err.message });
    res.status(500).json({ error: "Internal Server Error" });
}
