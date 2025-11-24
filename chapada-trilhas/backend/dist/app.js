"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const trailRoutes_1 = __importDefault(require("./interfaces/http/routes/trailRoutes"));
const authRoutes_1 = __importDefault(require("./interfaces/http/routes/authRoutes"));
const contactRoutes_1 = __importDefault(require("./interfaces/http/routes/contactRoutes"));
const sitemapController_1 = require("./interfaces/http/sitemapController");
const authMiddleware_1 = require("./interfaces/http/middleware/authMiddleware");
const errorHandler_1 = require("./interfaces/http/middleware/errorHandler");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)());
exports.app.use((0, compression_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, morgan_1.default)("dev"));
// Middleware de AOP auth (preenche req.user se token válido)
exports.app.use(authMiddleware_1.authMiddleware);
// Rotas API
exports.app.use("/api/trails", trailRoutes_1.default);
exports.app.use("/api/auth", authRoutes_1.default);
exports.app.use("/api/contacts", contactRoutes_1.default);
// Sitemap
exports.app.get("/sitemap.xml", sitemapController_1.sitemapController);
// Healthcheck
exports.app.get("/health", (_req, res) => res.json({ status: "ok" }));
// Tratamento de erros
exports.app.use(errorHandler_1.errorHandler);
