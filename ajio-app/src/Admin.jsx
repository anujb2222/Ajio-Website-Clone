import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Admin.css";
import { FaBox, FaPlus, FaShoppingCart, FaUsers, FaMoneyBill, FaHome } from "react-icons/fa";

function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); 

  const API_URL = "https://ajio-website-clone-1.onrender.com"; 

  useEffect(() => {
    axios
      .get(`${API_URL}/products`) 
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, []);

  const deleteProduct = (id) => {
    if (!window.confirm("Delete the product")) return;
    axios
  .delete(`${API_URL}/products/${id}`) 
  .then(() => setProducts(products.filter((p) => p._id !== id)))
  .catch((err) => console.log("Delete error:", err.response || err));
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
       <h2>Admin Panel</h2>

<ul>
  <li>
    <FaBox style={{ marginRight: "8px" }} />
    Products
  </li>

  <li onClick={() => navigate("/additem")}>
    <FaPlus style={{ marginRight: "8px" }} />
    Add Item
  </li>

  <li onClick={() => navigate("/admin/orders")}>
    <FaShoppingCart style={{ marginRight: "8px" }} />
    Orders
  </li>

  <li onClick={() => navigate("/admin/users")}>
    <FaUsers style={{ marginRight: "8px" }} />
    All-Users
  </li>

  <li onClick={() => navigate("/admin/payments")}>
    <FaMoneyBill style={{ marginRight: "8px" }} />
    Payments
  </li>

  <li onClick={() => navigate("/")}>
    <FaHome style={{ marginRight: "8px" }} />
    Go To Home
  </li>
</ul>
      </div>

      <div className="main-content">
        <div className="navbar"></div>

        <div style={{ marginBottom: "15px" }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
           <option value="Home and Kitchen">Home and Kitchen</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <table className="product-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>View</th>
              <th>Delete</th>
              <th>Update</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5}>No products available</td>
              </tr>
            ) : (
              products
                .filter((item) =>
                  selectedCategory ? item.category === selectedCategory : true
                )
                .map((item) => (
                  <tr key={item._id}>
                    <td>{item.itemName}</td>
                    <td>{item.category}</td>

                    <td>
                      <button
                        className="click-button"
                        onClick={() => navigate(`/viewitems/${item._id}`)}
                      >
                        View
                      </button>
                    </td>

                    <td>
                      <button
                        className="delete-button"
                        onClick={() => deleteProduct(item._id)}
                      >
                        Delete
                      </button>
                    </td>

                    <td>
                      <button
                        className="update-button"
                        onClick={() => navigate(`/updateitem/${item._id}`)}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;