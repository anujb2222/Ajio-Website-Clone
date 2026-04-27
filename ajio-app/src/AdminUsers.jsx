import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminUsers.css";
import { FaArrowLeft, FaEnvelope, FaPhone, FaIdBadge, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const API_URL = "https://ajio-website-clone-1.onrender.com";

  useEffect(() => {
    axios
      .get(`${API_URL}/auth/admin/users`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <button className="back-btn" onClick={() => navigate("/admin")}>
          <FaArrowLeft /> Back
        </button>
        <h2>User Management</h2>
      </div>

      {users.length === 0 ? (
        <div className="empty-users">
          <FaUsers size={50} style={{ marginBottom: "15px", opacity: 0.3 }} />
          <p>No users found.</p>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th><FaIdBadge /> User ID</th>
                <th><FaEnvelope /> Email</th>
                <th><FaPhone /> Phone</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="user-id">
                    #{user._id.slice(-8).toUpperCase()}
                  </td>

                  <td className="user-email">
                    {user.email || "No Email"}
                  </td>

                  <td className="user-phone">
                    {user.phone || "No Phone"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;