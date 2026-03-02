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
        // Cricket match discovery and tracking settings
        cricket: {
            activeTournament: { type: String, default: "T20 World Cup" },
            activeSeriesId: { type: String, default: "bbcaa2ce-be45-4541-9eb3-9828d8b13197" },
            autoTrackEnabled: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

const AppConfig = mongoose.models.AppConfig || mongoose.model("AppConfig", appConfigSchema);
module.exports = AppConfig;
