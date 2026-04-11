import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminLogin.css";

function AdminLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API_URL = "https://ajio-website-clone-1.onrender.com"; // Live backend URL

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        phone,
        password,
      });

      if (response.data.success) {
        alert("Login Successful");
        navigate("/admin");  // Navigate to Admin panel
      } else {
        alert("Invalid Phone or Password");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="overlay">
      <div className="admin-box">
        <span className="close-admin" onClick={() => navigate("/")}>
          X
        </span>

        <h2>Admin Login</h2>

        <div>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <br />
          <br />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <br />

          <button onClick={handleLogin}>LOGIN</button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;