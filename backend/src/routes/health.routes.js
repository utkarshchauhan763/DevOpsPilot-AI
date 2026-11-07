const express = require("express");
const mongoose = require("mongoose");
const sendResponse = require("../utils/response");
const router = express.Router();

router.get("/",(req,res) => {
    return sendResponse(res,200,"Health Check Successful", {
        status: "healthy",
        service: "DevOps Pilot AI"
    });
});
router.get("/database",(req,res)=>{
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1;
    return sendResponse(
        res, 
        isConnected ? 200 : 503,
        isConnected ? "Database connection is healthy" : "Database connection is unavailable",
        {
            database: "MongoDB",
            status: isConnected ? "connected" : "disconnected",
            readyState: dbState
        }
    );
});

module.exports = router;