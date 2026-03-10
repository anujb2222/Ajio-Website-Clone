import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Additem.css";

function ProductForm() {

  const navigate = useNavigate();
  const { id } = useParams();

  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {

    if (id) {
      axios.get(`http://localhost:5000/product/${id}`)
      .then(res => {
        setItemName(res.data.itemName);
        setItemQuantity(res.data.itemQuantity);
        setItemPrice(res.data.itemPrice);
      });
    }

  }, [id]);



  const handleSubmit = async () => {

    const data = new FormData();

    data.append("itemName", itemName);
    data.append("itemQuantity", itemQuantity);
    data.append("itemPrice", itemPrice);

    if (image) {
      data.append("image", image);
    }

    try {

      if (id) {

        await axios.put(
          `http://localhost:5000/updateitem/${id}`,
          data
        );

        alert("Item Updated");

      } else {

        await axios.post(
          "http://localhost:5000/additem",
          data
        );

        alert("Item Added");

      }

      navigate("/admin");

    } catch (error) {

      console.log(error);

    }

  };



return (
  <div className="additem-box">

        <span className="x-mark" onClick={() => navigate("/admin")}>X</span>

    <h2>{id ? "Update Item" : "Add Item"}</h2>

    <input
      type="text"
      placeholder="Item Name"
      value={itemName}
      onChange={(e) => setItemName(e.target.value)}
    />

    <input
      type="number"
      placeholder="Quantity"
      value={itemQuantity}
      onChange={(e) => setItemQuantity(e.target.value)}
    />

    <input
      type="number"
      placeholder="Price"
      value={itemPrice}
      onChange={(e) => setItemPrice(e.target.value)}
    />

    <input
      type="file"
      onChange={(e) => setImage(e.target.files[0])}
    />

    <button onClick={handleSubmit}>
      {id ? "Update Item" : "Add Item"}
    </button>

  </div>
);
}

export default ProductForm;