const { Queue } = require("bullmq");
const { redis } = require("../config/redis");

const incidentQueue = new Queue("incident-analysis",{
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000
        },
        removeOnComplete: {
            count: 100
        },
        removeOnFail: false
    }
});

module.exports = incidentQueue;