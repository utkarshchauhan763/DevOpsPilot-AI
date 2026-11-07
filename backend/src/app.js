const express = require("express");
const heathRoutes = require("./routes/health.routes");
const logger = require("./middleware/logger.middleware");
const notFound = require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/error.middleware");
const securityMiddleware = require("./middleware/security.middleware");
const incidentRoutes = require("./routes/incident.routes");
const app = express();
app.use(express.json());
app.use(logger);
app.use(securityMiddleware);
app.use("/api/health",heathRoutes);
app.use("/api/incidents",incidentRoutes);
app.use(notFound);
app.use(errorHandler);


module.exports = app;