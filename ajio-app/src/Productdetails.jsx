import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Productdetails.css";

function Productdetails() {
  const [product, setProduct] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const API_URL = "https://ajio-website-clone-1.onrender.com"; // Live backend URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`); // Correct route
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchData();
  }, [id]);

  if (!product) return <h1>Loading product...</h1>;

  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toDateString();
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);
    if (existing) existing.itemQuantity += 1;
    else cart.push({ ...product, itemQuantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Product added to Cart!");
  };

  return (
    <div className="product-page">
      <div className="product-container">
        <div className="product-left">
          <img
            src={product.image || "https://via.placeholder.com/300"}
            alt={product.itemName}
            onError={(e) => { e.target.src = "https://via.placeholder.com/300"; }}
          />
        </div>
        <div className="product-right">
          <h2 className="title">{product.itemName}</h2>
          <div className="rating">⭐⭐⭐⭐☆ <span>(120 Reviews)</span></div>
          <p className="price">₹ {product.itemPrice}</p>
          <p className="delivery-date">🚚 Expected Delivery: {getDeliveryDate()}</p>
          <div className="offers">
            <h4>Available Offers</h4>
            <ul>
              <li>✔ 10% Instant Discount on Credit Cards</li>
              <li>✔ Free Delivery within 3 days</li>
              <li>✔ 7 Days Replacement Policy</li>
            </ul>
          </div>
          <div className="description">
            <h4>Description</h4>
            <p>"High-quality product with durability and performance."</p>
          </div>
          <div className="buttons">
            <button className="cart-btn" onClick={() => addToCart(product)}>ADD TO CART</button>
            <button className="buy-btn">ORDER NOW</button>
            <button className="go-home-btn" onClick={() => navigate("/home")}>← Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Productdetails;