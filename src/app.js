import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";

import {
  notFound,
  errorHandler
} from "./middleware/errorHandler.js";

const app = express();

// Security middleware.
app.use(helmet());

// CORS configuration.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
  })
);

// HTTP request logger.
app.use(morgan("dev"));

// Parse JSON request bodies.
app.use(express.json({ limit: "10kb" }));

// Parse URL-encoded request bodies.
app.use(express.urlencoded({ extended: true }));

// Rate limiter.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later."
  }
});

// Welcome route.
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Student Course Enrollment API is running"
  });
});

// Apply rate limiting to API routes.
app.use("/api", limiter);

// API routes.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// Not-found and error middleware must come last.
app.use(notFound);
app.use(errorHandler);

export default app;