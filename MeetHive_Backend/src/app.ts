import express, { Application, response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import errorHandler from "./Middleware/errorHandler.middleware.js";
import { generalLimiter } from "./Middleware/rateLimiter.middleware.js";
import authRoutes from "./Routes/v1/auth.routes.js";

dotenv.config();

const app: Application = express();

app.use(helmet());

app.use((request, response, next) => {
  if (
    request.path.startsWith("/api/v1/auth") ||
    request.path.startsWith("/api/v1/user")
  ) {
    response.setHeader("Cache-Control", "no-store");
  }
  next();
});

app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(generalLimiter);

// Routes
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

export default app;
