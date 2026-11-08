const express = require("express");

const {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    deleteIncident
} = require("../controllers/incident.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createIncident);
router.get("/", protect, getIncidents);
router.get("/:id", protect, getIncidentById);
router.patch("/:id", protect, updateIncident);
router.delete("/:id", protect, deleteIncident);

module.exports = router;