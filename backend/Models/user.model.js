const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    ProfilePicture: {
      type: String,
      default: null,
    },

    designation: {
      type: String,
      default: "Senior Editor",
      trim: true,
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN", "SUPER_ADMIN", "VIEWER"],
      default: "USER",
    },

    permissions: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      hide: { type: Boolean, default: false }
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


const User = mongoose.model("User", userSchema);
module.exports = User;
