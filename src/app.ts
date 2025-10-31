import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import userRoutes from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import exportRouter from "./routes/export.routes";
import contactRequestRoutes from "./routes/contactRequest.routes";
import countryRoutes from "./routes/country.routes";
import surveyRoutes from "./routes/survey.routes";
import globalErrorHandler from "./global/errors/GlobalErrorHandler";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRouter);
app.use("/api/contact-request", contactRequestRoutes);
app.use("/api/export", exportRouter);

// Country Routes
app.use("/api/country", countryRoutes);

// Survey Routes
app.use("/api/survey", surveyRoutes);

// Static Files
if (process.env.NODE_ENV !== 'production') {
  app.use('/static', express.static(path.join(__dirname, '../src/assets')));
} else {
  // For production (when running from dist)
  app.use('/static', express.static(path.join(__dirname, 'assets')));
}

// Global Error Handler
app.use(globalErrorHandler);

export default app;
