"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: Number(process.env.PORT || 3000),
    db: {
        host: process.env.DB_HOST || "db",
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "chapada_trilhas"
    },
    jwt: {
        secret: process.env.JWT_SECRET || "changeme-secret",
        expiresIn: "8h"
    },
    env: process.env.NODE_ENV || "development"
};
