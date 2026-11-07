const express = require("express");
const {createIncident,getIncidents,getIncidentById,updateIncident,deleteIncident} = require("../controllers/incident.controller");
const router = express.Router();
router.post("/",createIncident);
router.get("/",getIncidents);
router.get("/:id",getIncidentById);
router.get("/:id",updateIncident);
router.get("/:id",deleteIncident);
module.exports = router;