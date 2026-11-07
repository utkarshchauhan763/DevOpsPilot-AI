const morgan = require("morgan");
const logger = morgan("dev");
// Morgan is HTTP request-logging middleware. The "dev" format displays concise development logs, including the HTTP method, URL, status code, and response time.
module.exports = logger;