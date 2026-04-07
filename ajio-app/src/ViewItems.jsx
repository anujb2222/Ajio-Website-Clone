import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ViewItems() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/product/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.log(err));
  }, [id]);

  if (!product) {
    return (
      <p style={{ textAlign: "center", marginTop: "120px", fontSize: "22px" }}>
        No Product Found
      </p>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8"
      }}
    >
      <div
        style={{
          position: "relative",
          width: "500px",
          padding: "40px",
          borderRadius: "16px",
          backgroundColor: "#fff",
          textAlign: "center"
        }}
      >
        <span
          onClick={() => navigate("/Admin")}
          style={{
            position: "absolute",
            top: "15px",
            fontSize: "45px",
            right: "20px",
            cursor: "pointer",
            color: "black"
          }}>
          ×
        </span>

        <h2 style={{ marginBottom: "20px", fontSize: "35px" }}>
          {product.itemName}
        </h2>
        {product.image && (
          <img
            src={`http://localhost:5000/uploads/${product.image}`}
            alt={product.itemName}
            style={{
              width: "100%",
              maxHeight: "350px",
              objectFit: "contain",  
              borderRadius: "12px",
              marginBottom: "20px",
            
            }}
          />
        )}
        <p style={{ margin: "12px ", fontSize: "24px" }}>
          <strong>Quantity:</strong> {product.itemQuantity}
        </p>

        <p style={{ margin: "12px ", fontSize: "24px" }}>
          <strong>Price:</strong> ₹{product.itemPrice}
        </p>
      </div>
    </div>
  );
}

export default ViewItems;