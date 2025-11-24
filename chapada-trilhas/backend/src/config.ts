import dotenv from "dotenv";
dotenv.config();

export const config = {
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
