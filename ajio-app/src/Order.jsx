import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaAddressCard, FaCheckCircle } from "react-icons/fa";
import axios from "axios";
import "./Order.css";

function Order() {
  const [activeTab, setActiveTab] = useState("select");
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

  const API_URL = "https://ajio-website-clone-1.onrender.com";

  
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/addresses/${userId}`);

      if (res.data.success) {
        setSavedAddresses(res.data.addresses);

        if (res.data.addresses.length > 0) {
          setSelectedAddressIndex(0);
          setActiveTab("select");
        } else {
          setActiveTab("add");
        }
      }
    } catch (err) {
      console.error("Fetch address error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && userId !== "undefined" && userId !== "null") {
      fetchAddresses();
    } else {
      setActiveTab("add");
    }
  }, [userId]);


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
    }

  
    else {
      if (
        !form.firstName ||
        !form.lastName ||
        !form.address1 ||
        !form.state
      ) {
        alert("Please fill all required fields");
        return;
      }

      if (!userId || userId === "undefined" || userId === "null") {
        alert("Please login");
        return;
      }

      try {
        setLoading(true);

        const res = await axios.post(`${API_URL}/addresses`, {
          ...form,
          userId
        });

        if (res.data.success) {
          shippingDetails = res.data.address;

        
          await fetchAddresses();
          setActiveTab("select");
        }
      } catch (err) {
        console.error("Save address error:", err);
        alert(err.response?.data?.message || "Failed to save address");
        return;
      } finally {
        setLoading(false);
      }
    }

   
    localStorage.setItem(
      "shippingDetails",
      JSON.stringify(shippingDetails)
    );

    navigate("/Payment");
  };

  return (
    <div className="order-container">
      <h2 className="order-header">1. DELIVERY ADDRESS</h2>

      <div className="address-section">

        {/* TABS */}
        <div className="address-tabs">
          <div
            className={`address-tab ${
              activeTab === "select" ? "active" : ""
            }`}
            onClick={() => setActiveTab("select")}
          >
            <FaAddressCard /> Select Address
          </div>

          <div
            className={`address-tab ${
              activeTab === "add" ? "active" : ""
            }`}
            onClick={() => setActiveTab("add")}
          >
            <FaPlus /> Add New Address
          </div>
        </div>

        {activeTab === "select" ? (
          <div className="select-address-view">
            {loading ? (
              <p>Loading addresses...</p>
            ) : savedAddresses.length > 0 ? (
              <div className="saved-addresses">
                {savedAddresses.map((addr, index) => (
                  <div
                    key={addr._id || index}
                    className={`address-card ${
                      selectedAddressIndex === index ? "selected" : ""
                    }`}
                    onClick={() => handleSelectAddress(index)}
                  >
                    {selectedAddressIndex === index && (
                      <FaCheckCircle className="select-icon" />
                    )}

                    <h4>
                      {addr.firstName} {addr.lastName}
                    </h4>
                    <p>{addr.address1}</p>
                    {addr.address2 && <p>{addr.address2}</p>}
                    <p>{addr.state}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No addresses found</p>
            )}

            {savedAddresses.length > 0 && (
              <button
                onClick={handleProceed}
                className="submit-btn"
                disabled={loading}
              >
                Deliver to this Address
              </button>
            )}
          </div>
        ) : (
     
          <form onSubmit={handleProceed} className="order-form">
            <input
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
            />

            <input
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
            />

            <input
              name="address1"
              placeholder="Address Line 1"
              value={form.address1}
              onChange={handleChange}
            />

            <input
              name="address2"
              placeholder="Address Line 2"
              value={form.address2}
              onChange={handleChange}
            />

            <select
              name="state"
              value={form.state}
              onChange={handleChange}
            >
              <option value="">Select State</option>
              <option>Karnataka</option>
              <option>Kerala</option>
              <option>TamilNadu</option>
              <option>Maharashtra</option>
              <option>Delhi</option>
              <option>Gujarat</option>
            </select>

            <button type="submit" className="submit-btn">
              Save & Deliver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Order;