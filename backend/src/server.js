require("dotenv").config();
const app = require("./app");
const config = require("./config/env");
const connectDB = require("./config/database");
const PORT = process.env.PORT || 5000;


const startServer = async () => {
    try {
        await connectDB();
        app.listen(config.port, () => {
            console.log(`DevOpsPilot AI server running on port ${config.port} in ${config.nodeEnv} mode`);
        });
    }
    catch(error){
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();