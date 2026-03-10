import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


 const handleLogin = () => {
    if (phone === "1234567890" && password === "1234") {
      alert("Login Successful");
       navigate("/admin")
    } else {
      alert("Invalid Phone or Password");
    }
  };


  return (
    <div className="overlay">
      <div className="admin-box">
        <span
  className="close-admin"
  onClick={() => navigate("/")}
>
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
          <br /><br />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br /><br />

          <button onClick={handleLogin}>LOGIN</button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;