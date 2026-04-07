import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Order.css";

function Order() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    state: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.address1 || !form.state) {
      alert("Please fill all required fields");
      return;
    }

   
    localStorage.setItem("shippingDetails", JSON.stringify(form));
    navigate("/Payment");
  };

  return (
    <div className="order-container">
      <h2 className="order-header">1. SHIPPING DETAILS</h2>
      <form onSubmit={handleSubmit} className="order-form">
        <label>First Name *</label>
        <input name="firstName" onChange={handleChange} required />

        <label>Last Name *</label>
        <input name="lastName" onChange={handleChange} required />

        <label>Address Line 1 *</label>
        <input name="address1" onChange={handleChange} required />

        <label>Address Line 2</label>
        <input name="address2" onChange={handleChange} />

        <label>State *</label>
        <select name="state" onChange={handleChange} required>
          <option value="">Select</option>
          <option>Karnataka</option>
          <option>Kerala</option>
          <option>TamilNadu</option>
          <option>Maharashtra</option>
        </select>

        <button type="submit" className="submit-btn">
          Proceed To Payment
        </button>
      </form>

      <div className="payment-bottom">
        <img
          src="images/payment-screenshot.png"
          alt="footer-screenshot"
          className="footer-screenshot"
        />
      </div>
    </div>
  );
}

export default Order;