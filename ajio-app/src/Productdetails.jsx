import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Productdetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://ajio-website-clone-1.onrender.com";

 
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


  const fetchReviews = () => {
    axios
      .get(`${API_URL}/reviews/${id}`)
      .then((res) => {
        console.log("REVIEWS:", res.data);
        setReviews(res.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  if (!product) return <h1>Loading product...</h1>;

  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toDateString();
  };

  const addToCart = (product, redirect = false) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);

    if (existing) {
      existing.itemQuantity += 1;
    } else {
      cart.push({ ...product, itemQuantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    if (redirect) {
      navigate("/Cart");
    } else {
      alert("Product added to Cart!");
    }
  };

  return (
    <div className="product-page">

    
      <div className="product-container">
        <div className="product-left">
          <img src={product.image} alt={product.itemName} />
        </div>

        <div className="product-right">
          <h2 className="title">{product.itemName}</h2>

          <div className="rating">
            ⭐⭐⭐⭐⭐
            <span
              style={{ cursor: "pointer", color: "blue", marginLeft: "8px" }}
              onClick={() => setShowReviews(true)}
            >
              ({reviews.length} Reviews)
            </span>
          </div>

          <p className="price">₹ {product.itemPrice}</p>

          <p className="delivery-date">
            🚚 Expected Delivery: {getDeliveryDate()}
          </p>

          <div className="offers">
            <h4>Available Offers</h4>
            <ul>
              <li>✔ 10% Instant Discount</li>
              <li>✔ Free Delivery</li>
              <li>✔ 7 Days Replacement</li>
            </ul>
          </div>

          <div className="description">
            <h4>Description</h4>
            <p>High-quality product with durability and performance.</p>
          </div>

          <div className="buttons">
            <button className="cart-btn" onClick={() => addToCart(product)}>
              ADD TO CART
            </button>

            <button className="buy-btn" onClick={() => addToCart(product, true)}>
              ORDER NOW
            </button>

            <button className="go-home-btn" onClick={() => navigate("/")}>
              ← Home
            </button>
          </div>
        </div>
      </div>

  
      <div className="related-section">
        <div className="slider">
          <div className="slider-track">
            {products.concat(products).map((item) => (
              <Link
                to={`/Productdetails/${item._id}`}
                key={item._id}
                className="card"
              >
                <img src={item.image} alt={item.itemName} />
                <div className="content">
                  <p>{item.itemName}</p>
                  <p>₹{item.itemPrice}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>


      {showReviews && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: "white",
              width: "400px",
              maxHeight: "500px",
              overflowY: "auto",
              padding: "20px",
              borderRadius: "10px"
            }}
          >
            <h3>Customer Reviews</h3>

            <button
              onClick={() => setShowReviews(false)}
              style={{ float: "right" }}
            >
              ✖
            </button>

            <div style={{ marginTop: "20px" }}>
              {reviews.length === 0 ? (
                <p>No reviews yet</p>
              ) : (
                reviews.map((r) => (
                  <div key={r._id} style={{ marginBottom: "10px" }}>
                    <p>{"⭐".repeat(r.rating)}</p>
                    <p><b>{r.userEmail}</b></p>
                    <p>{r.comment}</p>
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