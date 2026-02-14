const { default: mongoose } = require("mongoose");

const newsItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 300,
  },

  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  category: {
    type: String,
    required: true,
    trim: true,
  },

  subCategory: {
    type: String,
    trim: true,
  },

  summary: {
    type: String,
    trim: true,
    maxlength: 500,
  },

  content: {
    type: String,
    required: true,
    trim: true,
  },

  image: {
    type: String,
    default: null,
  },

  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  isLatest:   { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false },
}, ); 

const newsSchema = new mongoose.Schema(
  {
    india: [newsItemSchema],
    sports: [newsItemSchema],
    business: [newsItemSchema],
    technology: [newsItemSchema],
    entertainment: [newsItemSchema],
    lifestyle: [newsItemSchema],
    world: [newsItemSchema],
    health: [newsItemSchema],
    awards: [newsItemSchema],


    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


const NewsConfig = mongoose.model("NewsConfig", newsSchema);
module.exports = NewsConfig;
