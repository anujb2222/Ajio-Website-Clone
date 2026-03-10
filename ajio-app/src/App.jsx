import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Header from "./Header";
import Footer from "./Footer";
import SignIn from "./Signin";
import Register from "./register";
import AdminLogin from "./adminLogin";
import Display from "./Display";
// import Admin from "./Admin";
// import Additem from "./Additem";
// import ViewItems from "./ViewItems";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Home />

      <Routes>
        <Route path="/signin" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        {/* <Route path="/admin" element={<Admin />} /> */}
        {/* <Route path="/additem" element={<Additem />} /> */}
        {/* <Route path="/viewitems/:id" element={<ViewItems />} /> */}
      </Routes>
      <Display/>
      <Footer />

    </>
  );
}

export default App;