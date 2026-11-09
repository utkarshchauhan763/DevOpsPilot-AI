const sendResponse = require("../utils/response");
const Incident = require("../models/incident.model");
const incidentQueue = require("../queues/incident.queue");

const createIncident = async(req,res,next) => {
    try{
          const {
            title,
            description,
            service,
            severity,
            status,
            logs
        } = req.body;

         const incident = await Incident.create({
            title,
            description,
            service,
            severity,
            status,
            logs,
            createdBy: req.user.userId
        });

        let analysisJob = null;
        try{
            analysisJob = await incidentQueue.add("analyze-incident",{
                incidentId: incident._id.toString(),
                title: incident.title,
                service: incident.service,
                severity: incident.severity
            },
            {
                jobId: `incident-${incident._id}`
            }
        );
        console.log(`Analysis job added for incident: ${incident._id}`);
        }
        catch(queueError){
            console.error(
                "Failed to queue incident analysis:",
                queueError.message
            );
        }

        return sendResponse(
            res,
            201,
            analysisJob ?
            "Incident created and analysis job queued successfully" : "Incident created, but analysis job could not be queued",
           {
            incident,
            analysis: {
                status: analysisJob ? "queued": "queue_failed",
                jobId: analysisJob?.id || null
            }
           }
        );
    }catch(error){
        if(error.name === "ValidationError"){
            error.statusCode = 400;
        }
        next(error);
    }
};



const getIncidents = async (req, res, next) => {
    try {
        const {
            severity,
            status,
            service,
            search,
            startDate,
            endDate,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        // 1. Validate severity
        const allowedSeverities = ["low", "medium", "high", "critical"];

        if (severity && !allowedSeverities.includes(severity)) {
            const error = new Error("Invalid incident severity");
            error.statusCode = 400;
            throw error;
        }

        // 2. Validate status
        const allowedStatuses = ["open", "investigating", "resolved"];

        if (status && !allowedStatuses.includes(status)) {
            const error = new Error("Invalid incident status");
            error.statusCode = 400;
            throw error;
        }

        // 3. Validate pagination
        const pageNumber = Number(page);
        const pageSize = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            !Number.isInteger(pageSize) ||
            pageNumber < 1 ||
            pageSize < 1 ||
            pageSize > 100
        ) {
            const error = new Error("Invalid pagination parameters");
            error.statusCode = 400;
            throw error;
        }

        // 4. Validate sorting
        const allowedSortFields = [
            "createdAt",
            "updatedAt",
            "severity",
            "title"
        ];

        const allowedOrders = ["asc", "desc"];

        if (!allowedSortFields.includes(sortBy)) {
            const error = new Error("Invalid sorting field");
            error.statusCode = 400;
            throw error;
        }

        if (!allowedOrders.includes(order)) {
            const error = new Error("Invalid sorting order");
            error.statusCode = 400;
            throw error;
        }

        // 5. Build ownership and filter conditions
        const filters = {};

        if (req.user.role !== "admin") {
            filters.createdBy = req.user.userId;
        }

        if (severity) filters.severity = severity;
        if (status) filters.status = status;

        if (service) {
            filters.service = {
                $regex: service,
                $options: "i"
            };
        }

        // 6. Keyword search across multiple fields
        if (search) {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            const searchRegex = {
                $regex: escapedSearch,
                $options: "i"
            };

            filters.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { logs: searchRegex }
            ];
        }

        // 7. Validate and apply date filters
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        const parseDate = (value) => {
            if (!dateRegex.test(value)) return null;

            const date = new Date(`${value}T00:00:00.000Z`);

            if (
                Number.isNaN(date.getTime()) ||
                date.toISOString().slice(0, 10) !== value
            ) {
                return null;
            }

            return date;
        };

        if (startDate || endDate) {
            const dateFilter = {};

            if (startDate) {
                const start = parseDate(startDate);

                if (!start) {
                    const error = new Error(
                        "Invalid startDate. Use YYYY-MM-DD format"
                    );
                    error.statusCode = 400;
                    throw error;
                }

                dateFilter.$gte = start;
            }

            if (endDate) {
                const end = parseDate(endDate);

                if (!end) {
                    const error = new Error(
                        "Invalid endDate. Use YYYY-MM-DD format"
                    );
                    error.statusCode = 400;
                    throw error;
                }

                // Include the entire end date
                end.setUTCDate(end.getUTCDate() + 1);
                dateFilter.$lt = end;
            }

            if (
                dateFilter.$gte &&
                dateFilter.$lt &&
                dateFilter.$gte >= dateFilter.$lt
            ) {
                const error = new Error(
                    "startDate must be before or equal to endDate"
                );
                error.statusCode = 400;
                throw error;
            }

            filters.createdAt = dateFilter;
        }

        // 8. Calculate pagination
        const skip = (pageNumber - 1) * pageSize;

        // 9. Fetch filtered incidents and total count
        const [incidents, totalIncidents] = await Promise.all([
            Incident.find(filters)
                .sort({ [sortBy]: order === "asc" ? 1 : -1 })
                .skip(skip)
                .limit(pageSize),

            Incident.countDocuments(filters)
        ]);

        // 10. Calculate pagination metadata
        const totalPages = Math.ceil(totalIncidents / pageSize);

        return sendResponse(
            res,
            200,
            "Incidents fetched successfully",
            {
                pagination: {
                    totalIncidents,
                    totalPages,
                    currentPage: pageNumber,
                    pageSize,
                    hasNextPage: pageNumber < totalPages,
                    hasPreviousPage: pageNumber > 1
                },
                incidents
            }
        );

    } catch (error) {
        next(error);
    }
};

const getIncidentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const incident = await Incident.findById(id);

        if (!incident) {
            const error = new Error("Incident not found");
            error.statusCode = 404;
            throw error;
        }

        if (req.user.role !== "admin" && incident.createdBy?.toString() !== req.user.userId) {
            const error = new Error("You are not authorized to access this incident");
            error.statusCode = 403;
            throw error;
        }

        return sendResponse(res, 200, "Incident fetched successfully", incident);
    } catch (error) {
        if (error.name === "CastError") {
            error.statusCode = 400;
            error.message = "Invalid incident ID";
        }
        next(error);
    }
};

const updateIncident = async (req, res, next) => {
    try {
        const { id } = req.params;

        const allowedFields = [
            "title",
            "description",
            "service",
            "severity",
            "status",
            "logs"
        ];

        const updateData = {};

        for (const field of allowedFields) {
            if (Object.hasOwn(req.body, field)) {
                updateData[field] = req.body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            const error = new Error("No valid fields provided for update");
            error.statusCode = 400;
            throw error;
        }

        // Find incident
        const incident = await Incident.findById(id);

        if (!incident) {
            const error = new Error("Incident not found");
            error.statusCode = 404;
            throw error;
        }

        // Verify ownership
        if (
            req.user.role !== "admin" &&
            incident.createdBy?.toString() !== req.user.userId
        ) {
            const error = new Error(
                "You are not authorized to update this incident"
            );
            error.statusCode = 403;
            throw error;
        }

        // Apply permitted updates
        Object.assign(incident, updateData);

        await incident.save();

        return sendResponse(
            res,
            200,
            "Incident updated successfully",
            incident
        );

    } catch (error) {
        if (error.name === "CastError") {
            error.statusCode = 400;
            error.message = "Invalid incident ID";
        }

        if (error.name === "ValidationError") {
            error.statusCode = 400;
        }

        next(error);
    }
};

const deleteIncident = async(req,res,next) => {
    try{
        const {id} = req.params;
        const incident = await Incident.findById(id);
        if(!incident){
            const error = new Error("Incident not found");
            error.statusCode = 404;
            throw error;
        }
        if(req.user.role !== "admin" && incident.createdBy?.toString() !== req.user.userId){
            const error = new Error(
                "You are not authorized to delete this incident"
            );
            error.statusCode = 403;
            throw error;
        }
        await Incident.findByIdAndDelete(id);
        return sendResponse(res,200,"Incident deleted successfully",incident);

    }catch(error){
        if(error.name === "CastError"){
            error.statusCode = 400;
            error.message = "Invalid incident ID";
        }
        next(error);
    }
};

const getIncidentAnalysis = async(req,res,next) => {
    try{
        const incident = await Incident.findById(req.params.id);
        if(!incident){
            return sendResponse(res, 404, "Incident not found", null);
        }
        if(req.user.role !== "admin" && incident.createdBy?.toString() !== req.user.userId){
            return sendResponse(res, 403, "You are not authorized to access this incident");
        }
        return sendResponse(res, 200, "Incident AI analysis fetched successfully",
            {
                incidentId: incident._id,
                analysisStatus: incident.analysisStatus,
                aiAnalysis: incident.aiAnalysis,
                analysisError: incident.analysisError,
                analysisCompletedAt: incident.analysisCompletedAt
            }
        );
    }
    catch(error){
        next(error);
    }
};
module.exports = {
    createIncident,getIncidents,getIncidentById,updateIncident,deleteIncident,getIncidentAnalysis
};