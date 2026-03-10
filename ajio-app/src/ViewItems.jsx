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

  if (!product) return <p>NO PRODUCT</p>;

  return (
    <div 
      style={{
        display: "flex",
        marginTop: "80px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div 
        style={{
          position: "relative",
          textAlign: "center",
          padding: "90px",
          border: "1px solid black",
          borderRadius: "10px",
        }}
      >
      
        <span 
          onClick={() => navigate("/Admin")} 
          style={{ 
            position: "absolute", 
            top: "10px", 
            right: "10px", 
            cursor: "pointer", 
            fontWeight: "bold",
            fontSize: "20px"
          }}
        >
          X
        </span>

       <h2 style={{ fontWeight: "bold" }}>{product.itemName}</h2>
        <p>Quantity: {product.itemQuantity}</p>
        <p>Price: ₹{product.itemPrice}</p>
        {product.image && (
          <img 
            src={`http://localhost:5000/uploads/${product.image}`} 
            alt={product.itemName} 
            width={200} 
            style={{ marginTop: "10px", borderRadius: "8px" }}
          />
        )}
      </div>
    </div>
  );
}

export default ViewItems;