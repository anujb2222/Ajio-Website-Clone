import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Admin.css";

function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, []);



  const deleteProduct = (id) => {
    if (!window.confirm("Delete the product")) return;
    axios
      .delete(`http://localhost:5000/product/${id}`)
      .then(() => setProducts(products.filter((p) => p._id != id)))
      .catch((err) => console.log(err));
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li>Products</li>
          <li onClick={() => navigate("/additem")}>Add Item</li>
        </ul>
      </div>

      <div className="main-content">
        <div className="navbar"></div>
     <span className="x-mark" onClick={() => navigate("/")}>X</span>

        <table className="product-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>View</th>
              <th>Delete</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4}>No products available</td>
              </tr>
            ) : (
    products.map((item) => (
                <tr key={item._id}>
                  <td>{item.itemName}</td>
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