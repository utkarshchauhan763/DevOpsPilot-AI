
const express = require("express");
const mongoose = require("mongoose");
const sendResponse = require("../utils/response");
const { redis } = require("../config/redis");

const router = express.Router();

const HEARTBEAT_KEY = "devopspilot:incident-worker:heartbeat";

// Backend API Health
router.get("/", (req, res) => {
    return sendResponse(res, 200, "Health Check Successful", {
        status: "healthy",
        service: "DevOps Pilot AI"
    });
});

// MongoDB Health
router.get("/database", (req, res) => {
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1;

    return sendResponse(
        res,
        isConnected ? 200 : 503,
        isConnected
            ? "Database connection is healthy"
            : "Database connection is unavailable",
        {
            database: "MongoDB",
            status: isConnected ? "connected" : "disconnected",
            readyState: dbState
        }
    );
});

// Redis Health
router.get("/redis", async (req, res) => {
    try {
        const pingResponse = await redis.ping();
        const isConnected = pingResponse === "PONG";

        return sendResponse(
            res,
            isConnected ? 200 : 503,
            isConnected
                ? "Redis connection is healthy"
                : "Redis connection is unavailable",
            {
                service: "Redis",
                status: isConnected ? "connected" : "disconnected",
                response: pingResponse
            }
        );
    } catch (error) {
        return sendResponse(res, 503, "Redis connection is unavailable", {
            service: "Redis",
            status: "disconnected",
            error: error.message
        });
    }
});

// Incident Worker Health
router.get("/worker", async (req, res) => {
    try {
        const heartbeat = await redis.get(HEARTBEAT_KEY);

        if (!heartbeat) {
            return sendResponse(
                res,
                503,
                "Incident Worker is unavailable",
                {
                    service: "Incident Worker",
                    status: "unavailable"
                }
            );
        }

        const heartbeatAge = Date.now() - Number(heartbeat);
        const isHealthy =
            Number.isFinite(heartbeatAge) &&
            heartbeatAge >= 0 &&
            heartbeatAge <= 30000;

        return sendResponse(
            res,
            isHealthy ? 200 : 503,
            isHealthy
                ? "Incident Worker is healthy"
                : "Incident Worker heartbeat is stale",
            {
                service: "Incident Worker",
                status: isHealthy ? "healthy" : "unhealthy",
                heartbeatAge: `${heartbeatAge}ms`
            }
        );

    } catch (error) {
        console.error("Worker health check failed:", error.message);

        return sendResponse(
            res,
            503,
            "Incident Worker health check is unavailable",
            {
                service: "Incident Worker",
                status: "unavailable"
            }
        );
    }
});

module.exports = router;
