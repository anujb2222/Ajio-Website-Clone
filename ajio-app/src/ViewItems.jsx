import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewItem.css";

function ViewItems() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  const API_URL = "https://ajio-website-clone-1.onrender.com";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <p className="no-product-msg">Product not found</p>;
  }

  return (
    <div className="view-items-wrapper">
      <div className="view-items-card">

        <span className="close-btn" onClick={() => navigate("/Admin")}>
          &times;
        </span>

        {/* LEFT SIDE - IMAGE */}
        <div className="product-image-section">
          {product.image ? (
            <img
              src={product.image}
              alt={product.itemName}
              className="view-product-image"
            />
          ) : (
            <div className="no-image-placeholder">No Image Available</div>
          )}
        </div>

        <div className="product-details-section">
          <p className="product-category">{product.category || "Fashion"}</p>
          <h2 className="product-title">{product.itemName}</h2>
          <div className="product-divider"></div>

          <div className="info-group">
            <span className="info-label">Current Price</span>
            <div className="price-value">₹{product.itemPrice}</div>
          </div>

          <div className="info-group">
            <span className="info-label">Availability</span>
            <div className="qty-value">
              {product.itemQuantity} Units
              <span className="stock-status">
                {product.itemQuantity > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/Admin")}
            >
              BACK TO INVENTORY
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ViewItems;