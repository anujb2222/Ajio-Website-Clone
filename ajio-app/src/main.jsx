import React from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route ,BrowserRouter} from "react-router-dom";
import Admin from "./Admin";
import App from "./App";
import Additem from "./Additem";
import ViewItems from "./ViewItems";
import UpdateItem from "./UpdateItem";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>

          <Route path="/admin" element={<Admin />} />
          <Route path="/additem" element={<Additem />} />
           <Route path="/*" element={<App />}/>
            <Route path="/viewitems/:id" element={<ViewItems />} />

         <Route path="/updateitem/:id" element={<UpdateItem />} />


    </Routes>

  </BrowserRouter>
);
