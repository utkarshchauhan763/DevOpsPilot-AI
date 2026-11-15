const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const logger = require("./middleware/logger.middleware");
const notFound = require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/error.middleware");
const securityMiddleware = require("./middleware/security.middleware");
const incidentRoutes = require("./routes/incident.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Allowed frontend origins
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    ...(process.env.FRONTEND_URL || "")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean)
];

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        console.log("Incoming request origin:", origin);
        console.log("Allowed origins:", allowedOrigins);

        if (!origin || allowedOrigins.includes(origin)) {
            console.log("CORS allowed:", origin);
            return callback(null, true);
        }

        console.log("CORS blocked:", origin);
        return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Global middleware
app.use(express.json({ limit: "1mb" }));
app.use(logger);
app.use(securityMiddleware);

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/auth", authRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
