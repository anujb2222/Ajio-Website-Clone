import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Additem.css";

function Additem() {
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();



  const handleAddItem = async () => {
    if (!itemName || !itemQuantity || !itemPrice) {
      alert("All fields are required");
      return;
    }


    const data = new FormData();
    data.append("itemName", itemName);
    data.append("itemQuantity", itemQuantity);
    data.append("itemPrice", itemPrice);
    if (image) data.append("image", image);

    try {
      const res = await axios.post("http://localhost:5000/additem", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        alert("Item added successfully");
        setItemName("");
        setItemQuantity("");
        setItemPrice("");
        setImage(null);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="additem-box">
      <span 
        style={{ float: "right", cursor: "pointer", fontWeight: "bold", fontSize: "20px" }} 
        onClick={() => navigate("/admin")}>X</span>

      <h2>Add Item</h2>

      <input type="text" placeholder="Item Name" value={itemName} onChange={e => setItemName(e.target.value)} />
      <input type="number" placeholder="Quantity" value={itemQuantity} onChange={e => setItemQuantity(e.target.value)} />
      <input type="number" placeholder="Price" value={itemPrice} onChange={e => setItemPrice(e.target.value)} />

      <input type="file" onChange={e => setImage(e.target.files[0])} />

      <button onClick={handleAddItem}>Add Item</button>
      
    </div>
  );
}

export default Additem;