import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signin.css";

function SignIn({ setIsLoggedIn }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!phone) {
      alert("Enter phone number");
      return;
    }
    if (!password) {
      alert("Enter password");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/login", { phone, password });
      if (response.data.success) {
        localStorage.setItem("userId", response.data.userId); 
        setIsLoggedIn(true);
        alert("Login successful");
        navigate("/");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert("Invalid phone number or password");
    }
  };

  return (
    <div className="overlay">
      <div className="login-box">
        <span className="close-btn" onClick={() => navigate("/")}>X</span>
        <h2>Welcome to AJIO</h2>

        <label>Enter Mobile Number <span>*</span></label>
        <input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label>Password <span>*</span></label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>LOGIN</button>
        <button onClick={() => navigate("/register")} style={{ marginTop: "10px" }}>REGISTER</button>

        <p className="terms">
          By Signing In, I agree to <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>
        </p>

        <p className="terms">
          Click here to login <a href="/otp-login">using OTP</a>
        </p>
      </div>
    </div>
  );
}

export default SignIn;