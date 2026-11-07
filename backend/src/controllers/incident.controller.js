const sendResponse = require("../utils/response");
const Incident = require("../models/incident.model");
const createIncident = async(req,res,next) => {
    try{
        const incident = await Incident.create(req.body);
        return sendResponse(
            res,
            201,
            "Incident created successfully",
            incident
        );
    }catch(error){
        if(error.name === "ValidationError"){
            error.statusCode = 400;
        }
        next(error);
    }
};

const getIncidents = async(req,res,next) => {
    try{
        const{ severity,status,service } = req.query;
        const allowedSeverities = ["low","medium","high","critical"];
        if(severity && !allowedSeverities.includes(severity)){
            const error = new Error("Invalid incident severity");
            error.statusCode = 400;
            throw error;
        }
        const allowedStatuses = [
            "open","investigating","resolved"
        ];
        if(status && !allowedStatuses.includes(status)){
            const error = new Error("Invalid incident status");
            error.statusCode = 400;
            throw error;
        }
        const filters = {};
        if(severity) filters.severity = severity;

        if(status) filters.status = status;
        if(service){
            filters.service = {
                $regex: service,
                $options: "i"
            };
        }
        
        // Retrieve incidents from MongoDB
        const incidents = await Incident.find(filters)
            .sort({ createdAt: -1 });

        return sendResponse(res,200,"Incidents fetched successfully",{
            total: incidents.length,
            incidents
        });
    }catch(error){
        next(error);
    }
};

const getIncidentById = async(req,res,next) => {
    try{
        const {id} = res.params;
        const incident = await Incident.findById(id);
        if(!incident){
            const error = new Error("Incident not found");
            error.statusCode = 404;
            throw error;
        }
        return sendResponse(res,200,"Incident fetched successfully",incident);
    }
    catch(error){
        if(error.name === "CastError"){
            error.statusCode = 400;
            error.message = "Invalid incident ID";
        }
        next(error);
    }
}

const updateIncident = async(req,res,next) => {
    try{
        const {id} = req.params;
        const allowedFields = ["title","description","service","severity","status","logs"];
        const updateData = [];
        for(const field of allowedFields){
            if(Object.hasOwn(req.body,field)){
                updateData[field] = req.body[field];
            }
        }
        if(Object.keys(updateData).length === 0){
            const error = new Error("No valid fields provided for update");
            error.statusCode = 400;
            throw error;
        }

        const incident = await Incident.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators:true
            }
        );
        if(!incident){
            const error = new Error("Incident not found");
            error.statusCode = 404;
            throw error;
        }
        return sendResponse(res,200,"Incident updated successfully",incident);
    }
    catch(error){
        if(error.name === "CastError"){
            error.statusCode = 400;
            error.message = "Invalid incident ID";
        }
        if(error.name === "ValidationError"){
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
        return sendRequest(res,200,"Incident deleted successfully",incident);

    }catch(error){
        if(error.name === "CastError"){
            error.statusCode = 400;
            error.message = "Invalid incident ID";
        }
        next(error);
    }
};
module.exports = {
    createIncident,getIncidents,getIncidentById,updateIncident,deleteIncident
};