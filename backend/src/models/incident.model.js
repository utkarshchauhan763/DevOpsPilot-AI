const mongoose = require("mongoose");
const incidentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        service: {
            type: String,
            enum: ["low","medium","high","critical"],
            default: "medium"
        },
        status:{
            type: String,
            enum: ["open","investigating","resolved"],
            default: "open"
        },
        logs: {
            type: String,
            default: ""
        }

    },
    {
        timestamps: true
    }
);

const Incident = mongoose.model("Incident",incidentSchema);
module.exports = Incident;