const mongoose = require("mongoose");

const breakingNewsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        link: {
            type: String,
            trim: true,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        priority: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: true,
    }
);

const BreakingNews = mongoose.models.BreakingNews || mongoose.model("BreakingNews", breakingNewsSchema);

module.exports = BreakingNews;
