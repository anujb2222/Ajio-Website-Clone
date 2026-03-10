import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Additem.css";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/product/${id}`);
        setItemName(res.data.itemName);
        setItemQuantity(res.data.itemQuantity);
        setItemPrice(res.data.itemPrice);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleUpdate = async () => {
    if (!itemName || !itemQuantity || !itemPrice) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("itemName", itemName);
    formData.append("itemQuantity", itemQuantity);
    formData.append("itemPrice", itemPrice);
    if (image) formData.append("image", image);

    try {
      const res = await axios.put(
        `http://localhost:5000/updateitem/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data.success) {
        alert("Item updated successfully");
        navigate("/admin");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update item");
    }
  };

  return (
    <div className="additem-box">
      <span
        style={{ float: "right", cursor: "pointer", fontWeight: "bold", fontSize: 20 }}
        onClick={() => navigate("/admin")}
      >
        X
      </span>

      <h2>Update Item</h2>

      <input type="text" placeholder="Item Name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
      <input type="number" placeholder="Quantity" value={itemQuantity} onChange={(e) => setItemQuantity(e.target.value)} />
      <input type="number" placeholder="Price" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />

      <button onClick={handleUpdate}>Update Item</button>
    </div>
  );
};

export default UpdateProduct;