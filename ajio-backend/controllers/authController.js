require("dotenv").config();
const User = require("../models/User");
const axios = require("axios");

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Update User in DB
        await User.findOneAndUpdate(
            { email },
            { email, otp, otpExpiry: Date.now() + 5 * 60 * 1000 },
            { upsert: true }
        );

        // Direct API Call to Brevo
        const response = await axios({
            method: 'post',
            url: 'https://api.brevo.com/v3/smtp/email',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            data: {
                sender: { 
                    name: "OTP Service", 
                    email: process.env.EMAIL_USER // Must be verified in Brevo
                },
                to: [{ email: email }],
                subject: "Your OTP Code",
                htmlContent: `<h2>Your OTP is: <b>${otp}</b></h2>`,
                textContent: `Your OTP is ${otp}`
            }
        });

        console.log("EMAIL SENT SUCCESS:", response.data.messageId);
        res.json({ success: true, message: "OTP sent to email" });

    } catch (err) {
        // Detailed error logging
        if (err.response) {
            console.error("BREVO API ERROR:", err.response.data);
        } else {
            console.error("SEND OTP ERROR:", err.message);
        }
        res.status(500).json({ message: "Error sending OTP" });
    }
};
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "User not found" });
        if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
        if (user.otpExpiry < Date.now()) return res.status(400).json({ message: "OTP expired" });

        
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.json({ success: true, message: "Login successful", userId: user._id });
    } catch (err) {
        console.error("VERIFY OTP ERROR:", err);
        res.status(500).json({ message: "Error verifying OTP" });
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