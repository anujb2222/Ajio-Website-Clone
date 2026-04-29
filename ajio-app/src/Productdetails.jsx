import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Productdetails.css";
import { FaStar, FaShoppingCart, FaBolt, FaShieldAlt, FaTruck, FaUndo, FaArrowLeft, FaTimes, FaUserCircle } from "react-icons/fa";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);

  const API_URL = "https://ajio-website-clone-1.onrender.com";

  const getDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5);
    return deliveryDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const addToCart = (item, isBuyNow = false) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((i) => i._id === item._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const { itemQuantity, ...rest } = item;
      cart.push({ ...rest, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    if (isBuyNow) {
      navigate("/cart");
    } else {
      alert("Added to cart!");
    }
  };

  const fetchReviews = () => {
    axios
      .get(`${API_URL}/reviews/${id}`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  useEffect(() => {
    axios
      .get(`${API_URL}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  if (!product)
    return (
      <div className="error-state">
        <h1>Product not found</h1>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="product-details-page">
      <button className="floating-back-btn" onClick={() => navigate("/")}>
        <FaArrowLeft />
      </button>

      <div className="main-content-wrapper">
        <div className="product-visuals">
          <div className="image-main-container">
            <img
              src={product.image}
              alt={product.itemName}
              className="main-image"
            />
          </div>
        </div>

        <div className="product-info-panel">
          <h1 className="product-title-text">{product.itemName}</h1>

          <div
            className="rating-summary"
            onClick={() => setShowReviews(true)}
          >
            <div className="stars-pill">
              {averageRating} <FaStar className="star-icon" />
            </div>
            <span className="review-count">
              {reviews.length} Ratings & Reviews
            </span>
          </div>

          <div className="pricing-container">
            <span className="current-price">₹{product.itemPrice}</span>
            <span className="mrp">
              MRP <del>₹{Math.round(product.itemPrice * 1.5)}</del>
            </span>
            <span className="discount-tag">(60% OFF)</span>
            <p className="tax-info">inclusive of all taxes</p>
          </div>

          <div className="delivery-pincode-section">
            <div className="delivery-header">
              <FaTruck className="truck-icon" />
              <span>
                Deliver to: <b>400001</b>
              </span>
            </div>
            <p className="expected-delivery">
              Expected Delivery by <b>{getDeliveryDate()}</b>
            </p>
          </div>

          <div className="trust-badges">
            <div className="badge-item">
              <FaShieldAlt />
              <span>100% Genuine</span>
            </div>
            <div className="badge-item">
              <FaUndo />
              <span>Easy 15 days returns</span>
            </div>
            <div className="badge-item">
              <FaBolt />
              <span>Express Shipping</span>
            </div>
          </div>

          <div className="action-footer">
            <button
              className="add-to-cart-btn"
              onClick={() => addToCart(product)}
            >
              <FaShoppingCart /> ADD TO BAG
            </button>
            <button
              className="buy-now-btn"
              onClick={() => addToCart(product, true)}
            >
              BUY NOW
            </button>
          </div>

          <div className="product-description-card">
            <h3>Product Details</h3>
            <p>
              Premium quality craftsmanship meets modern design. This product
              offers exceptional durability and a sleek aesthetic that
              complements any lifestyle.
            </p>
          </div>
        </div>
      </div>

      <div className="related-products-section">
        <div className="section-header">
          <h2>Customers Also Viewed</h2>
          <div className="header-line"></div>
        </div>

        <div className="related-slider-container">
          <div className="slider-track-premium">
            {products.concat(products).map((item, index) => (
              <Link
                to={`/Productdetails/${item._id}`}
                key={`${item._id}-${index}`}
                className="related-card-premium"
              >
                <div className="card-img-wrapper">
                  <img src={item.image} alt={item.itemName} />
                </div>
                <div className="card-content-premium">
                  <p className="card-item-name">{item.itemName}</p>
                  <p className="card-item-price">₹{item.itemPrice}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {showReviews && (
        <div
          className="reviews-modal-overlay"
          onClick={() => setShowReviews(false)}
        >
          <div
            className="reviews-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Ratings & Reviews</h3>
              <button
                className="close-modal"
                onClick={() => setShowReviews(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="overall-rating-stats">
              <div className="big-rating">{averageRating}</div>
              <div className="rating-desc">
                <div className="star-row">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < Math.floor(averageRating)
                          ? "star filled"
                          : "star"
                      }
                    />
                  ))}
                </div>
                <p>{reviews.length} Verified Buyers</p>
              </div>
            </div>

            <div className="reviews-list-premium">
              {reviews.length === 0 ? (
                <div className="empty-reviews">
                  <p>No reviews yet</p>
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r._id} className="review-card-premium">
                    <div className="review-user-info">
                      <FaUserCircle className="user-icon" />
                      <div className="user-details-meta">
                        <p className="user-email">
                          {r.userEmail || "Verified User"}
                        </p>
                        <div className="user-rating-pill">
                          {r.rating} <FaStar className="small-star" />
                        </div>
                      </div>
                    </div>
                    <p className="review-comment-text">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;