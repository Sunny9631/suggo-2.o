const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, required: false, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    online: { type: Boolean, default: false },
    lastSeenAt: { type: Date },
    // Email verification fields
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOTP: { type: String, default: null },
    emailVerificationOTPExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);