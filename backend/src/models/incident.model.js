
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
        },

        aiAnalysis: {
            rootCause: {
                type: String,
                default: ""
            },
            impact: {
                type: String,
                default: ""
            },
            troubleshootingSteps: {
                type: [String],
                default: []
            },
            prevention: {
                type: [String],
                default: []
            }
        },

        analysisStatus: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending"
        },

        analysisError: {
            type: String,
            default: ""
        },

        analysisCompletedAt: {
            type: Date,
            default: null
        }


    },
    {
        timestamps: true
    }
);

const Incident = mongoose.model("Incident", incidentSchema);

module.exports = Incident;
