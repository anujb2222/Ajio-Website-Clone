import React from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route ,BrowserRouter} from "react-router-dom";
import Admin from "./Admin";
import App from "./App";
import Additem from "./Additem";
import ViewItems from "./ViewItems";
import Productdetails  from "./Productdetails";
import Cart from "./Cart"; 
// import Order from "./Order";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>

          <Route path="/admin" element={<Admin />} />
          <Route path="/additem" element={<Additem />} />
     <Route path="/updateitem/:id" element={<Additem/>} />
           <Route path="/*" element={<App />}/>
            <Route path="/viewitems/:id" element={<ViewItems />} />
            <Route path ="/Productdetails/:id" element={<Productdetails/>}/> 
           <Route path="/cart" element={<Cart/>}/>
            {/* <Route path="/Order" element={<ORDER NOW/>}/> */}
          
         
    
    </Routes>

  </BrowserRouter>
);
