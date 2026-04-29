import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminReviews.css"; 
import { FaArrowLeft, FaStar, FaUser, FaBox, FaCalendarAlt, FaQuoteLeft } from "react-icons/fa";
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
        setLoading(true);
        const res = await axios.get(`${API_URL}/reviews/all`);
        
        if (Array.isArray(res.data)) {
          setReviews(res.data);
        } else if (res.data && Array.isArray(res.data.reviews)) {
          setReviews(res.data.reviews);
        } else {
          setError("Received unexpected data format from server.");
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError(err.response?.data?.error || err.message || "Unable to retrieve reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner"></div>
        <p>Loading Reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-loading-screen">
        <h2 style={{ color: "#ff6b6b" }}>{error}</h2>
        <button className="premium-back-btn" onClick={() => navigate("/admin")} style={{ marginTop: "20px" }}>
          <FaArrowLeft />
        </button>
      </div>
    );
  }

  return (
    <div className="admin-reviews-page">
      <div className="admin-top-bar">
        <div className="header-left">
          <button className="premium-back-btn" onClick={() => navigate("/admin")}>
            <FaArrowLeft />
          </button>
          <div className="header-title">
            <h2>Reviews Management</h2>

          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="admin-empty-state">
          <div className="empty-icon-wrapper">
            <FaQuoteLeft />
          </div>
          <h3>No Reviews Yet</h3>
          <p>When customers leave feedback, they will appear here.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="premium-admin-table">
            <thead>
              <tr>
                <th><FaBox /> Product</th>
                <th><FaUser /> User Details</th>
                <th><FaStar /> Rating & Comment</th>
                <th><FaCalendarAlt /> Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id}>
                  <td>
                    <div className="product-cell">
                      {review.productId?.image && (
                        <img 
                          src={review.productId.image} 
                          alt={review.productId.itemName} 
                          className="product-image-small"
                        />
                      )}
                      <div className="product-info-meta">
                        <span className="product-name-text">
                          {review.productId?.itemName || "Product Not Found"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-info-stack">
                      <span className="user-email-text">{review.userId?.email || review.userId?.phone || "Anonymous User"}</span>
                      <span className="user-id-text">ID: {review.userId?._id?.slice(-8).toUpperCase() || "N/A"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="review-content-stack">
                      <div className="star-rating-row">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} color={i < review.rating ? "#ff7f50" : "#dee2e6"} />
                        ))}
                      </div>
                      <div className="comment-text-box">
                        {review.comment}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="date-cell-text">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
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

export default AdminReviews;