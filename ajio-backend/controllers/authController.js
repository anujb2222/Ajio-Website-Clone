require("dotenv").config();
const User = require("../models/User");
const axios = require("axios");

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Valid email required"
      });
    }

    if (!process.env.BREVO_API_KEY || !process.env.EMAIL_USER) {
      return res.status(500).json({
        success: false,
        message: "Server config error"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
      },
      { upsert: true, new: true }
    );

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "OTP Service",
          email: process.env.EMAIL_USER,
        },
        to: [{ email }],
        subject: "Your OTP Code",
        htmlContent: `<h2>Your OTP is: <b>${otp}</b></h2>`,
        textContent: `Your OTP is ${otp}`,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.response?.data?.message || "Email sending failed",
    });
  }
};
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email & OTP required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.json({
      success: true,
      message: "Login successful",
      userId: user._id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const exists = await User.findOne({ phone });

    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    await User.create({ phone, password });

    return res.json({
      success: true,
      message: "Registered successfully",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const user = await User.findOne({ phone });

    if (!user || user.password !== password) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      userId: user._id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();  // Fetch all users
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);  // Log the actual error object
    res.status(500).json({
      message: "Error fetching users",
      error: err.message,  // Send back the error message
    });
  }
};