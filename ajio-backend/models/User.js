const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true, sparse: true },
  password: String,
  email: { type: String, unique: true, sparse: true },
  otp: String,
  otpExpiry: Date
});

module.exports = mongoose.model("User", userSchema);