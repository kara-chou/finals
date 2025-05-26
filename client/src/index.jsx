import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import Login from "./components/pages/Login";
import Home from "./components/pages/Home";
import Classes from "./components/pages/Classes";
import NotFound from "./components/pages/NotFound";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "612582615698-704pocdm5pca68trnq3jdvt5il3ta2k9.apps.googleusercontent.com";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/classes" element={<Classes />} />
      <Route path="/classes/:id" element={<Classes />} />
    </Route>
  )
);

// renders React Component "Root" into the DOM element with ID "root"
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);
