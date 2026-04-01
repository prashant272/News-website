const mongoose = require("mongoose");

const breakingNewsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        priority: {
            type: Number,
            default: 0,
        },
        scheduledAt: {
            type: Date,
            default: Date.now
        },
        lang: {
            type: String,
            enum: ["en", "hi"],
            default: "en",
            index: true,
        },
        state: {
            type: String,
            default: "universal",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const BreakingNews = mongoose.models.BreakingNews || mongoose.model("BreakingNews", breakingNewsSchema);

module.exports = BreakingNews;
