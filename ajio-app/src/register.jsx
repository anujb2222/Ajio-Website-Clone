import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signin.css";

function Register() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const API_URL = "https://ajio-website-clone-1.onrender.com";

  const handleRegister = async () => {
    if (!phone || !password || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/register`, {  
        phone,
        password,
      });

      console.log("Register response:", res.data);

      alert(res.data.message);

      if (res.data.success) {
        navigate("/signin"); 
      }

    } catch (err) {
      console.error("Register error:", err.response?.data || err);
      alert(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="overlay">
      <div className="login-box">
        <span className="close-btn" onClick={() => navigate("/")}>X</span>
        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button onClick={handleRegister}>
          REGISTER
        </button>

        <button
          onClick={() => navigate("/signin")}
          style={{ marginTop: "10px" }}
        >
          LOGIN
        </button>
      </div>
    </div>
  );
}

export default Register;