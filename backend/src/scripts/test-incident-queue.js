
const incidentQueue = require("../queues/incident.queue");
const { redis } = require("../config/redis");

const addTestJob = async () => {
    try {
        const job = await incidentQueue.add(
            "test-incident",
            {
                incidentId: "TEST-INC-001",
                title: "Database Connection Failure",
                service: "database",
                severity: "high",
                logs: "MongoDB connection timeout"
            }
        );

        console.log("Test job added successfully!");
        console.log("Job ID:", job.id);
        console.log("Job Data:", job.data);

    } catch (error) {
        console.error("Failed to add test job:", error.message);
    } finally {
        await incidentQueue.close();
        await redis.quit();
    }
};

addTestJob();
