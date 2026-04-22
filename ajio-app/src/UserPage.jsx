import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserPage.css";
import { FaArrowLeft, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = "https://ajio-website-clone-1.onrender.com";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/admin/users`);
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Unable to retrieve user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="user-loading">Loading Users...</div>;

  if (error) return <div className="user-error">{error}</div>;

  return (
    <div className="user-table-container">
      <div className="user-table-header">
        <button className="user-back-btn" onClick={() => navigate("/admin")}>
          <FaArrowLeft /> Back
        </button>
        <h2>
          <FaUsers /> All Registered Users ({users.length})
        </h2>
      </div>

      <div className="table-responsive">
        <table className="user-simple-table">
          <thead>
            <tr>
              <th>Serial No.</th>
              <th>User ID</th>
              <th>Email / Contact</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>No users found.</td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td className="user-id-cell">{user._id}</td>
                  <td>{user.email || user.phone || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserPage;