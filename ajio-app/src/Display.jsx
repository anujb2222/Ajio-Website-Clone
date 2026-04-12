import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Display.css";

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("https://ajio-website-clone-1.onrender.com/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log("Error:", err));
  }, []);

  return (
    <div className="products">
      <div className="products-grid">

        {products.map((item) => (
          <Link
            to={`/Productdetails/${item._id}`}
            key={item._id}
            className="card"
          >

          
            {/* <img
              src={item.image}
              alt={item.itemName}

              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150";
              }}
            /> */}

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

export default Products;