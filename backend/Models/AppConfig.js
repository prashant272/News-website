const mongoose = require("mongoose");

/**
 * AppConfig — stores global system-level configuration.
 * Each setting is identified by a unique `key`.
 * Currently used for storing global Facebook Page credentials.
 */
const appConfigSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        // Facebook Page global credentials
        facebook: {
            pageId: { type: String, default: null },
            pageName: { type: String, default: null },
            pageAccessToken: { type: String, default: null },
            connectedAt: { type: Date, default: null },
            autoPostEnabled: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

const AppConfig = mongoose.models.AppConfig || mongoose.model("AppConfig", appConfigSchema);
module.exports = AppConfig;
