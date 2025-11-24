import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import trailRoutes from "./interfaces/http/routes/trailRoutes";
import authRoutes from "./interfaces/http/routes/authRoutes";
import contactRoutes from "./interfaces/http/routes/contactRoutes";
import { sitemapController } from "./interfaces/http/sitemapController";
import { authMiddleware } from "./interfaces/http/middleware/authMiddleware";
import { errorHandler } from "./interfaces/http/middleware/errorHandler";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

// Middleware de AOP auth (preenche req.user se token válido)
app.use(authMiddleware);

// Rotas API
app.use("/api/trails", trailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);

// Sitemap
app.get("/sitemap.xml", sitemapController);

// Healthcheck
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Tratamento de erros
app.use(errorHandler);
