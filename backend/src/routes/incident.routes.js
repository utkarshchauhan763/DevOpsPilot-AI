const express = require("express");

const {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    deleteIncident,
    getIncidentAnalysis
} = require("../controllers/incident.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createIncident);
router.get("/", protect, getIncidents);
router.get("/:id", protect, getIncidentById);
router.patch("/:id", protect, updateIncident);
router.delete("/:id", protect, deleteIncident);
router.get("/:id/analysis",protect,getIncidentAnalysis);

module.exports = router;