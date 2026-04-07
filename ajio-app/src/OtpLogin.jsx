import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signin.css";

function OtpLogin({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/send-otp", { email: email.trim() });
      alert(res.data.message);
    } catch (err) {
      alert("Error sending OTP");
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      alert("Please enter the OTP");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/verify-otp", { email: email.trim(), otp: otp.trim() });
      if (res.data.success) {
        localStorage.setItem("userId", res.data.userId); 
        setIsLoggedIn(true);
        alert("Login successful");
        navigate("/");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="overlay">
      <div className="login-box">
        <span className="close-btn" onClick={() => navigate("/")}>X</span>
        <h2>Login using OTP</h2>

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={sendOtp}>SEND OTP</button>

        <label>OTP</label>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button onClick={verifyOtp}>LOGIN</button>

        <p>
          Click here to login with phone <a href="/signin">Phone Login</a>
        </p>
      </div>
    </div>
  );
}

export default OtpLogin;