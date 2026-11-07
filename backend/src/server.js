require("dotenv").config();
const app = require("./app");
const config = require("./config/env");
const PORT = process.env.PORT || 5000;

app.listen(config.port,()=>{
    console.log(`DevOpsPilot AI server running on port ${config.port} in ${config.nodeEnv} mode`);
});



