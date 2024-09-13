const mongoose = require("mongoose");
 
const { Types } = mongoose;

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    profileImage: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    confirmEmail: { type: Boolean, default: false },
    status: {
      type: String,
      default: "Offline",
      enum: ["Online", "Offline", "Blocked", "SoftDeleted"],
    },
    isDeleted: { type: Boolean, default: false },
    role: { type: String, default: "User", enum: ["User", "Admin"] },
    OTP: {
      OTPCode: String,
      expireDate: Date,
    },
    OTPNumber: { type: Number, default: 0 },
    favorites: [{ type: Types.ObjectId, ref: "Listing" }],
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;