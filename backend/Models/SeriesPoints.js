const mongoose = require("mongoose");

const SeriesPointsSchema = new mongoose.Schema({
    seriesId: { type: String, required: true, unique: true },
    seriesName: { type: String, required: true },
    isManual: { type: Boolean, default: false },
    data: { type: Array, default: [] },      // English Flat
    groups: { type: Array, default: [] },    // English Groups
    data_hi: { type: Array, default: [] },   // Hindi Flat
    groups_hi: { type: Array, default: [] }, // Hindi Groups
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("SeriesPoints", SeriesPointsSchema);
