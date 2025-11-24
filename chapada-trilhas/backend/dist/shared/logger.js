"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// Logger simples estruturado
exports.logger = {
    info: (msg, meta) => {
        console.log(JSON.stringify({ level: "info", msg, ...meta, ts: new Date().toISOString() }));
    },
    error: (msg, meta) => {
        console.error(JSON.stringify({ level: "error", msg, ...meta, ts: new Date().toISOString() }));
    }
};
