const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema({
    image: {
        type: String,
        required: false,
        default: ""
    },
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    source: {
        type: String,
        trim: true,
        default: ""
    },
    videoUrl: {
        type: String,
        trim: true,
        default: ""
    }
});

const visualStorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        trim: true,
        lowercase: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    slides: [slideSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        default: "general"
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Optimization: Add Index for fast lookups by slug and filtering by status
visualStorySchema.index({ slug: 1 });
visualStorySchema.index({ isActive: 1 });

visualStorySchema.pre("validate", function () {
    if (this.title) {
        this.slug = this.title
            .toLowerCase()
            .trim()
            .replace(/[^\w ]+/g, "")
            .replace(/ +/g, "-");
    }
});

module.exports = mongoose.models.VisualStory || mongoose.model("VisualStory", visualStorySchema);
