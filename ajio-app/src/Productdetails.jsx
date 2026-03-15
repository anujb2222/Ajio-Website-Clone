import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./Productdetails.css";

function Productdetails() {
  const [product, setProduct] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/product/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [id]);

  if (!product) {
    return <h1>No product details...</h1>;
  }

  return (
    <div className="product-details">
      <div className="Product-image">
      <img
        src={`http://localhost:5000/uploads/${product.image}`}
           width={600}
           height={600}
        alt={product.name}/>
        </div>
       <div className="detail-name">
        <p>{product.itemName}</p>
        <p>{product.itemQuantity}</p>
        <p>{product.itemPrice}</p>
        </div>

        <div className="buttons">
         <button> ORDER NOW</button>
         <button>  ADD TO CART </button>
         </div>
      </div>
  );
}

export default Productdetails;