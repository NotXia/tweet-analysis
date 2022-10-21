import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import home_routes from "./pages/Home/routes";

let routes = [];
routes = routes.concat(home_routes);

routes.push({ path: "/*", loader: () => { window.location.href=`${process.env.REACT_APP_BASE_PATH}/not-found.html` } }); // Gestione not found (lasciare come ultimo route)
const router = createBrowserRouter(routes, { basename: process.env.REACT_APP_BASE_PATH });


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <RouterProvider router={router} />
);