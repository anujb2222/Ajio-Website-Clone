import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaAddressCard, FaCheckCircle } from "react-icons/fa";
import axios from "axios";
import "./Order.css";

function Order() {
  const [activeTab, setActiveTab] = useState("select"); // "select" or "add"
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    state: ""
  });

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    console.log("Current userId from localStorage:", userId);
    if (userId && userId !== "undefined" && userId !== "null") {
      fetchAddresses();
    } else {
      setActiveTab("add");
    }
  }, [userId]);

  const API_URL = "https://ajio-website-clone-1.onrender.com";

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/addresses/${userId}`;
      console.log("Fetching addresses from:", url);
      const response = await axios.get(url);
      if (response.data.success) {
        setSavedAddresses(response.data.addresses);
        if (response.data.addresses.length > 0) {
          setSelectedAddressIndex(0);
          setActiveTab("select");
        } else {
          setActiveTab("add");
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelectAddress = (index) => {
    setSelectedAddressIndex(index);
  };

  const handleProceed = async (e) => {
    e.preventDefault();
    
    let shippingDetails;
    
    if (activeTab === "select") {
      if (selectedAddressIndex === null) {
        alert("Please select an address");
        return;
      }
      shippingDetails = savedAddresses[selectedAddressIndex];
    } else {
      if (!form.firstName || !form.lastName || !form.address1 || !form.state) {
        alert("Please fill all required fields");
        return;
      }
      
      if (!userId || userId === "undefined" || userId === "null") {
        alert("Please login to save address");
        // Fallback for guest if needed, but per request we use userId
        shippingDetails = form;
      } else {
        try {
          setLoading(true);
          const url = `${API_URL}/addresses`;
          console.log("Saving address to:", url, "Data:", { ...form, userId });
          const response = await axios.post(url, {
            ...form,
            userId
          });
          if (response.data.success) {
            shippingDetails = response.data.address;
            // Refresh list or just proceed
          }
        } catch (error) {
          console.error("Error saving address:", error);
          const errorMsg = error.response?.data?.message || error.message || "Failed to save address. Please try again.";
          alert(errorMsg);
          setLoading(false);
          return;
        }
      }
    }

    localStorage.setItem("shippingDetails", JSON.stringify(shippingDetails));
    navigate("/Payment");
  };

  return (
    <div className="order-container">
      <h2 className="order-header">1. DELIVERY ADDRESS</h2>
      
      <div className="address-section">
        <div className="address-tabs">
          <div 
            className={`address-tab ${activeTab === "select" ? "active" : ""}`}
            onClick={() => setActiveTab("select")}
          >
            <FaAddressCard /> Select Address
          </div>
          <div 
            className={`address-tab ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            <FaPlus /> Add New Address
          </div>
        </div>

        {activeTab === "select" ? (
          <div className="select-address-view">
            {loading ? (
              <div className="no-address-msg">Loading addresses...</div>
            ) : savedAddresses.length > 0 ? (
              <div className="saved-addresses">
                {savedAddresses.map((addr, index) => (
                  <div 
                    key={addr._id || index} 
                    className={`address-card ${selectedAddressIndex === index ? "selected" : ""}`}
                    onClick={() => handleSelectAddress(index)}
                  >
                    {selectedAddressIndex === index && <FaCheckCircle className="select-icon" style={{ position: "absolute", top: "10px", right: "10px", color: "#2c4152" }} />}
                    <h4>{addr.firstName} {addr.lastName}</h4>
                    <p>{addr.address1}</p>
                    {addr.address2 && <p>{addr.address2}</p>}
                    <p>{addr.state}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-address-msg">
                <p>No saved addresses found. Please add a new address.</p>
                <button className="submit-btn" style={{ width: "auto", padding: "10px 20px" }} onClick={() => setActiveTab("add")}>Add New Address</button>
              </div>
            )}
            
            {savedAddresses.length > 0 && (
              <button onClick={handleProceed} className="submit-btn" disabled={loading}>
                {loading ? "Processing..." : "Deliver to this Address"}
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleProceed} className="order-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Enter first name" />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Enter last name" />
              </div>
            </div>

            <div className="form-group">
              <label>Address Line 1 *</label>
              <input name="address1" value={form.address1} onChange={handleChange} required placeholder="House No, Building Name, Street" />
            </div>

            <div className="form-group">
              <label>Address Line 2</label>
              <input name="address2" value={form.address2} onChange={handleChange} placeholder="Area, Landmark (Optional)" />
            </div>

            <div className="form-group">
              <label>State *</label>
              <select name="state" value={form.state} onChange={handleChange} required>
                <option value="">Select State</option>
                <option>Karnataka</option>
                <option>Kerala</option>
                <option>TamilNadu</option>
                <option>Maharashtra</option>
                <option>Delhi</option>
                <option>Gujarat</option>
              </select>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Saving..." : "Save and Deliver Here"}
            </button>
          </form>
        )}
      </div>

      <div className="payment-bottom" style={{ padding: "0 25px 25px" }}>
        <img
          src="images/payment-screenshot.png"
          alt="footer-screenshot"
          className="footer-screenshot"
          style={{ width: "100%", borderRadius: "4px" }}
        />
      </div>
    </div>
  );
}

export default Order;