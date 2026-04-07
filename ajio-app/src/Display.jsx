import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Display.css";

function Display() {
  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/products")
      .then(res => setProductsList(res.data))
      .catch(err => console.log("Error:", err));
  }, []);

  return (
    <div className="scroll-container">
      <div className="products-grid">
        {productsList.concat(productsList).map((item, index) => (
          <Link
            to={`/Productdetails/${item._id}`}
            key={item._id + "-" + index}
            className="card"
          >
            <img
              src={`http://localhost:5000/uploads/${item.image}`}
              alt={item.itemName}
            />
            <div className="content">
              <p>{item.itemName}</p>
              <p>₹{item.itemPrice}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Display;