const mongoose = require('mongoose');

const InternationalProgramSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('InternationalProgram', InternationalProgramSchema);
