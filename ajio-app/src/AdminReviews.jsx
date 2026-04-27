import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminOrders.css";
import { FaArrowLeft, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = "https://ajio-website-clone-1.onrender.com";

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/reviews/all`);
        setReviews(res.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Unable to retrieve reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="admin-orders-table-container">
        <h2>Loading Reviews...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-orders-table-container">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="admin-orders-table-container">
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
        <button
          style={{
            background: "#eee",
            border: "none",
            padding: "8px 15px",
            borderRadius: "4px",
            cursor: "pointer"
          }}
          onClick={() => navigate("/admin")}
        >
          <FaArrowLeft /> Back
        </button>

        <h2 style={{ margin: 0 }}>Product Reviews ({reviews.length})</h2>
      </div>

      {reviews.length === 0 ? (
        <p style={{ fontSize: "20px", padding: "20px" }}>No reviews found.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>User Details</th>
              <th>Rating & Comment</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {reviews.map((review) => (
              <tr key={review._id}>
                {/* Product */}
                <td>
                  <div
                    className="product-item"
                    style={{ flexDirection: "column", alignItems: "flex-start" }}
                  >
                    {review.productId?.image && (
                      <img
                        src={review.productId.image}
                        alt={review.productId.itemName}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "contain",
                          border: "1px solid #eee",
                          borderRadius: "4px"
                        }}
                      />
                    )}

                    <span style={{ fontSize: "16px", fontWeight: "600", marginTop: "5px" }}>
                      {review.productId?.itemName || "Product Not Found"}
                    </span>
                  </div>
                </td>

                {/* User */}
                <td>
                  <div style={{ fontSize: "16px" }}>
                    <p><strong>ID:</strong> {review.userId?._id || "N/A"}</p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {review.userId?.email || review.userId?.phone || "N/A"}
                    </p>
                  </div>
                </td>

                {/* Rating */}
                <td>
                  <div style={{ fontSize: "16px" }}>
                    <div style={{ color: "#f39c12", marginBottom: "5px" }}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          color={i < review.rating ? "#f39c12" : "#ddd"}
                        />
                      ))}
                    </div>

                    <p style={{ fontStyle: "italic", color: "#555" }}>
                      {review.comment
                        ? `"${review.comment}"`
                        : "No comment provided"}
                    </p>
                  </div>
                </td>

                {/* Date */}
                <td style={{ fontSize: "16px" }}>
                  {new Date(review.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminReviews;