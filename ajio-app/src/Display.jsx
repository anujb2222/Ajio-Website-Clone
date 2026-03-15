import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Display.css";

function Products() {
  const [product, setProduct] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/products")
      .then((res) => {
        console.log(res.data);
        setProduct(res.data);
      })
      .catch((err) => console.log("Error:", err));
  }, []);

  const slider = {
    dots: false,
    speed: 5000,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1,
    cssEase: "linear",
  };

  return (
    <div className="products">
      <Slider {...slider}>
        {product.map((item) => (
          <Link to={`/Productdetails/${item._id}`} key={item._id}>
            <div className="card">
              <img
                src={`http://localhost:5000/uploads/${item.image}`}
                width={200}
                alt={item.itemName}
              />
              <div className="content">
              <p>{item.itemName}</p>
              <p>Quantity: {item.itemQuantity}</p>
              <p>Price: ₹{item.itemPrice}</p>
              </div>
            </div>
          </Link>
        ))}
      </Slider>
    </div>
  );
}

export default Products;