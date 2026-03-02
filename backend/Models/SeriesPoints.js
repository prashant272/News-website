const mongoose = require("mongoose");

const SeriesPointsSchema = new mongoose.Schema({
    seriesId: { type: String, required: true, unique: true },
    seriesName: { type: String, required: true },
    isManual: { type: Boolean, default: false },
    data: { type: Array, default: [] },      // Flat list (all teams, for backward compat)
    groups: { type: Array, default: [] },    // Array of { groupName, rows } for multi-group
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("SeriesPoints", SeriesPointsSchema);
