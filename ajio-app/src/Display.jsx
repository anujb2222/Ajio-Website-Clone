import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Display.css";
import { FaStar } from "react-icons/fa";

function Display() {
  const [products, setProducts] = useState([]);
  const API_URL = "https://ajio-website-clone-1.onrender.com";

  useEffect(() => {
    axios
      .get(`${API_URL}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.log("Error:", err));
  }, []);

  return (
    <div className="display-section">
      <div className="scroll-container-premium">
        <div className="products-grid-premium">
          {products.concat(products).map((item, index) => (
            <Link
              to={`/Productdetails/${item._id}`}
              key={`${item._id}-${index}`}
              className="product-card-premium"
            >
              <div className="image-wrapper">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.itemName}
                    className="product-img"
                  />
                )}
              </div>

              <div className="product-meta">
                <h3 className="product-name">{item.itemName}</h3>

                <div className="rating-row">
                  <div className="stars">
                    <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
                  </div>
                  <span className="rating-count">(1.2k)</span>
                </div>

                <div className="price-row">
                  <span className="final-price">₹{item.itemPrice}</span>
                  <span className="original-price">
                    ₹{Math.round(item.itemPrice * 1.6)}
                  </span>
                  <span className="discount-percent">(60% OFF)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Display;