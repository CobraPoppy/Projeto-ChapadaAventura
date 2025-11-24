import { app } from "./app";
import { config } from "./config";
import { logger } from "./shared/logger";

app.listen(config.port, () => {
  logger.info("server_started", { port: config.port });
});
