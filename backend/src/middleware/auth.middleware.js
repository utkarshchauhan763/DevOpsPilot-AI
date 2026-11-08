const jwt = require("jsonwebtoken");
const config = require("../config/env");

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            const error = new Error("Authentication token required");
            error.statusCode = 401;
            throw error;
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, config.jwtSecret);

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            error.statusCode = 401;
            error.message = "Authentication token has expired";
        } else if (error.name === "JsonWebTokenError") {
            error.statusCode = 401;
            error.message = "Invalid authentication token";
        }
        next(error);
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            const error = new Error("Authentication required");
            error.statusCode = 401;
            return next(error);
        }
        if (!allowedRoles.includes(req.user.role)) {
            const error = new Error("You are not authorized to perform this action");
            error.statusCode = 403;
            return next(error);
        }
        next();
    }
}
module.exports = { protect, authorize };