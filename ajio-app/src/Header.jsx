import React from "react";
import { FaShoppingBag, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Header.css";

function Header({ isLoggedIn, setIsLoggedIn }) {

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="header">
      <div className="container">
        <div className="logo">
          <img
            src="https://assets-jiocdn.ajio.com/static/img/Ajio-Logo.svg"
            alt="AJIO"
          />
        </div>

        <div className="nav">
          <div className="item">MEN <img src="https://assets-jiocdn.ajio.com/static/img/filter-downarrow-icon.png" alt="" className="arrow" /></div>
          <div className="item">WOMEN <img src="https://assets-jiocdn.ajio.com/static/img/filter-downarrow-icon.png" alt="" className="arrow" /></div>
          <div className="item">KIDS <img src="https://assets-jiocdn.ajio.com/static/img/filter-downarrow-icon.png" alt="" className="arrow" /></div>
          <div className="item">BEAUTY <img src="https://assets-jiocdn.ajio.com/static/img/filter-downarrow-icon.png" alt="" className="arrow" /></div>
          <div className="item home-kitchen">HOME & KITCHEN <img src="https://assets-jiocdn.ajio.com/static/img/filter-downarrow-icon.png" alt="" className="arrow" /></div>
        </div>

        <div className="right">
          <div className="links">
            {!isLoggedIn ? (
              <span className="Signin">
                <Link to="/signin">Sign In / Join AJIO</Link>
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <FaUserCircle size={22} />
                <span style={{ cursor: "pointer" }} onClick={handleLogout}>
                  Logout
                </span>
              </span>
            )}

            <span>Customer Care</span>
            <button>Visit AJIOLUXE</button>

            <Link to="/admin-login" className="Admin">ADMIN</Link>
          </div>

          <div className="search">
            <input type="text" placeholder="Search AJIO" />
            <img src="https://assets-jiocdn.ajio.com/static/img/wishlistIcon.svg" alt="Wishlist" />
            <FaShoppingBag className="shopping-cart" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;