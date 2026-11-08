
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
            required: true,
            trim: true
        },
        severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium"
        },
        status: {
            type: String,
            enum: ["open", "investigating", "resolved"],
            default: "open"
        },
        logs: {
            type: String,
            default: ""
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Incident = mongoose.model("Incident", incidentSchema);

module.exports = Incident;
