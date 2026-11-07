const express = require("express");
const sendResponse = require("../utils/response");
const router = express.Router();

router.get("/",(req,res) => {
    return sendResponse(res,200,"Health Check Successful", {
        status: "healthy",
        service: "DevOps Pilot AI"
    });
});

module.exports = router;