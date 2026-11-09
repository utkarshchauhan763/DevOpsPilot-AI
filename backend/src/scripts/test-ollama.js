
const { analyzeIncident } = require("../services/ollama.service");

const testOllama = async () => {
    try {
        console.log("Starting structured AI analysis...\n");

        const result = await analyzeIncident({
            title: "MongoDB Connection Failure",
            description: "The application cannot connect to MongoDB.",
            service: "database",
            severity: "critical",
            logs: "MongoServerSelectionError: Server selection timed out after 30000 ms"
        });

        console.log("AI Analysis Completed Successfully!\n");

        console.log("Root Cause:");
        console.log(result.analysis.rootCause);

        console.log("\nImpact:");
        console.log(result.analysis.impact);

        console.log("\nTroubleshooting Steps:");

        result.analysis.troubleshootingSteps.forEach((step, index) => {
            console.log(`${index + 1}. ${step}`);
        });

        console.log("\nPrevention:");

        result.analysis.prevention.forEach((step, index) => {
            console.log(`${index + 1}. ${step}`);
        });

    } catch (error) {
        console.error("AI Analysis Test Failed:", error.message);
    }
};

testOllama();
