const express = require("express");
const heathRoutes = require("./routes/health.routes");
const app = express();
const notFound = require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/error.middleware");
app.use(express.json());
app.use("/api/health",heathRoutes);
app.use(notFound);
app.use(errorHandler);


module.exports = app;