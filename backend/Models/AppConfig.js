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
        // OneSignal push notification settings
        onesignal: {
            appId: { type: String, default: null },
            restApiKey: { type: String, default: null },
            enabled: { type: Boolean, default: true },
        },
        // LinkedIn - multiple accounts supported
        linkedinAccounts: [{
            accountId: { type: String },     // urn:li:person:XXX or urn:li:organization:XXX
            accountName: { type: String },
            accessToken: { type: String },
            type: { type: String, default: "person" }, // "person" or "organization"
            autoPostEnabled: { type: Boolean, default: true },
            connectedAt: { type: Date, default: Date.now },
        }],
        // Keep old field for backward compat (will be migrated)
        linkedin: {
            accessToken: { type: String, default: null },
            memberId: { type: String, default: null },
            memberName: { type: String, default: null },
            autoPostEnabled: { type: Boolean, default: true },
        },
        // Twitter (X) credentials
        twitter: {
            appKey: { type: String, default: null },
            appSecret: { type: String, default: null },
            accessToken: { type: String, default: null },
            accessSecret: { type: String, default: null },
            username: { type: String, default: null },
            autoPostEnabled: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

const AppConfig = mongoose.models.AppConfig || mongoose.model("AppConfig", appConfigSchema);
module.exports = AppConfig;
