import React from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route ,BrowserRouter} from "react-router-dom";
import Admin from "./Admin";
import App from "./App";
import Additem from "./Additem";
import ViewItems from "./ViewItems";
import Productdetails  from "./Productdetails";
import Cart from "./Cart"; 
import Order from "./Order";
import Payment from "./Payment";
import AdminOrders from "./AdminOrders";
import AdminPayment from "./AdminPayment";
import OrderSuccess from "./OrderSuccess";
import AdminUsers from "./AdminUsers";
import AdminReviews from "./AdminReviews";
import AdminSalesOverview from "./AdminSalesOverview";

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
            <Route path="/order" element={<Order />} />
           <Route path ="/Payment" element={<Payment/>}/> 
               <Route path="/admin/orders" element={<AdminOrders />} />
             <Route path="/admin/payments" element={<AdminPayment />} />
<Route path="/order-success" element={<OrderSuccess />} />
  <Route path="/admin/users" element={<AdminUsers/>} /> 
<Route path="/admin/reviews" element={<AdminReviews />} /> 
 
        <Route path="/admin/sales" element={<AdminSalesOverview />} /> 

         
    
    </Routes>

  </BrowserRouter>
);
