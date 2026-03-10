import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
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

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2000,
    slidesToShow: 4,
    slidesToScroll: 1,
  };

  return (
    <div className="products">
    

      <Slider {...settings}>

        {product.map((item) => (
          <div className="card" key={item.id}>

            <img
              src={`http://localhost:5000/uploads/${item.image}`}
              width={200}
              alt={item.name}
            />

            <p>{item.name}</p>

          </div>
        ))}

      </Slider>

    </div>
  );
}

export default Products;