const mongoose = require("mongoose");
const config = require("./env");

const connectDB = async() =>{
    try{
        await mongoose.connect(config.mongodbUri);
    }catch(error){
        console.error("MongoDB connection failed.",error.message);
        process.exit(1);
    }
};

module.exports = connectDB;