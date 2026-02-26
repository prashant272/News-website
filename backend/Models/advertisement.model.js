const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  headerImageUrl: {
    type: String,
  },
  sidebarImageUrl: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  placement: {
    type: String,
    enum: ['header', 'sidebar', 'in-article'],
    default: 'header'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Ad || mongoose.model('Ad', adSchema);
