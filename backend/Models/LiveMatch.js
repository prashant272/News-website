const mongoose = require("mongoose");

const LiveMatchSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    matchType: { type: String },
    status: { type: String },
    venue: { type: String },
    date: { type: String },
    startTime: { type: String },
    dateTimeGMT: { type: Date },
    teams: [{ type: String }],
    team1CaptainImg: { type: String },
    team2CaptainImg: { type: String },
    teamInfo: [mongoose.Schema.Types.Mixed],
    score: [mongoose.Schema.Types.Mixed],
    metaText: { type: String },
    series_id: { type: String },
    matchStarted: { type: Boolean },
    matchEnded: { type: Boolean },
    category: { type: String, enum: ['live', 'upcoming', 'recent'], required: true },
    isLiveTracked: { type: Boolean, default: false },
    showInUpcoming: { type: Boolean, default: false },
    showInRecent: { type: Boolean, default: false },
    isDiscoveryOnly: { type: Boolean, default: true },
    isManual: { type: Boolean, default: false },
    fullScorecard: { type: mongoose.Schema.Types.Mixed },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for faster lookups by category
LiveMatchSchema.index({ category: 1 });

const LiveMatch = mongoose.model("LiveMatch", LiveMatchSchema);
module.exports = LiveMatch;
