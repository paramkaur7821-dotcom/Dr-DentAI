import "./lib/env";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const LOCAL_DEV_ORIGINS = ["http://localhost:5173"];

function resolveAllowedOrigins(): string[] {
  const fromEnv = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return [...new Set([...LOCAL_DEV_ORIGINS, ...fromEnv])];
}

const allowedOrigins = resolveAllowedOrigins();

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      logger.warn({ origin }, "Blocked by CORS");
      callback(null, false);
    },
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", router);

export default app;
