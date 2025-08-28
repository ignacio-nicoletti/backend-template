// src/app.ts
import express from "express";
import cors from "cors";
import { setupSwagger } from "./swagger";
import { config } from "./config";
import type { Request, Response, NextFunction } from "express";
import type { DBConfig } from "../../shared/types";

import userRoutes from "../../app/routes/user.route";
import { errorHandler } from "./middleware/errorHandler";

const env = process.env.NODE_ENV || "development";
const dbConfig: DBConfig = config.db;

const app = express();

setupSwagger(app);

// Opciones de CORS con tipo correcto
const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requests sin origin (como mobile apps o curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (dbConfig.whiteList.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Bloqueado por CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  exposedHeaders: "set-cookie",
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(errorHandler);
// Middleware para manejar errores de CORS
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS policy blocked this request" });
  } else {
    next(err);
  }
});

//routes
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "API is running",
    environment: env,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/user", userRoutes);

export default app;
