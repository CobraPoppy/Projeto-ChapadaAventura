"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const logger_1 = require("./shared/logger");
app_1.app.listen(config_1.config.port, () => {
    logger_1.logger.info("server_started", { port: config_1.config.port });
});
