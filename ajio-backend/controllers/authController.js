require("dotenv").config();
const User = require("../models/User");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

   
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min expiry

 
    await User.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { upsert: true, returnDocument: "after" }
    );

    await transporter.sendMail({
      from: process.env.EMAIL_FROM, 
      to: email,
      subject: "Your OTP Login",
      text: `Your OTP is: ${otp}`
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};


exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (!user.otpExpiry || user.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

   
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ success: true, message: "Login successful", userId: user._id });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.register = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ phone });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    await User.create({ phone, password });
    res.json({ success: true, message: "Registered successfully" });
  } catch (err) {
  console.error("REGISTER ERROR:", err);
  if (err.code === 11000)
    return res.status(400).json({ message: "User already exists" });
  res.status(500).json({ message: "Server error" });
}
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || user.password !== password)
      return res.json({ success: false, message: "Invalid credentials" });

    res.json({ success: true, message: "Login successful", userId: user._id });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};