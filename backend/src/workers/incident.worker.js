const { Worker } = require("bullmq");
const { redis, connectRedis } = require("../config/redis");
const connectDB = require("../config/database");
const Incident = require("../models/incident.model");
const { analyzeIncident } = require("../services/ollama.service");

const processIncident = async(job) => {
    console.log("-------------");
    console.log("Processing incident job....");
    console.log("Job ID:",job.id);
    console.log("Job Name:", job.name);
   
    const { incidentId } = job.data;
    const incident = await Incident.findById(incidentId);
    if(!incident){
        throw new Error(`Incident not found: ${incidentId}`);
    } 

    console.log("Incident retrieved successfully");
    incident.analysisStatus = "processing";
    incident.analysisError = "";
    await incident.save();
    try{
        console.log("Starting AI incident analysis....");
        const aiResult = await analyzeIncident({
            title: incident.title,
            description: incident.description,
            service: incident.service,
            severity: incident.severity,
            logs: incident.logs
        });
        incident.aiAnalysis = aiResult.analysis;
        incident.analysisStatus = "completed";
        incident.analysisError = "";
        incident.analysisCompletedAt = new Date();
        
        await incident.save();

        console.log("AI analysis saved successfully in MongoDB");
        console.log("-----------------------");
        console.log(aiResult.analysis);
        console.log("-----------------------");

        return{
            success: true,
            incidentId: incident._id.toString(),
            analysis: aiResult.analysis,
            analysisStatus: incident.analysisStatus,
            processedAt: incident.analysisCompletedAt
        }


    }
    catch(error){
        incident.analysisStatus = "failed";
        incident.analysisError = error.message;

        await incident.save();

        console.error("AI analysis failed:", error.message);

        // Throwing allows BullMQ to retry the job
        throw error;
    }
};

const startIncidentWorker = async() =>{
    await connectDB();
    await connectRedis();

    const incidentWorker = new Worker("incident-analysis", processIncident, {
        connection: redis,
        concurrency: 5
    });

    incidentWorker.on("completed", (job, result) => {
        console.log(`Job ${job.id} completed successfully`);
        console.log("Result:", result);
    });

    incidentWorker.on("failed", (job, error) => {
        console.error(`Job ${job?.id} failed:`, error.message);
    });

    incidentWorker.on("error", (error) => {
        console.error("Worker error:", error.message);
    });

    console.log("Incident Worker is running");

    return incidentWorker;
};

startIncidentWorker().catch((error)=>{
    console.log("failed to start Incident Worker:",error.message);
    process.exit(1);
});

