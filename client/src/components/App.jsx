import React, { useState, useEffect, createContext } from "react";
import { Outlet } from "react-router-dom";

import jwt_decode from "jwt-decode";

import "../utilities.css";

import { socket } from "../client-socket";

import { get, post } from "../utilities";

export const UserContext = createContext(null);

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    get("/api/whoami")
      .then((user) => {
        if (user._id) {
          // they are registed in the database, and currently logged in.
          setUserId(user._id);
        }
      })
      .catch((err) => {
        console.error("Error checking login status:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleLogin = async (credentialResponse) => {
    try {
      const userToken = credentialResponse.credential;
      const decodedCredential = jwt_decode(userToken);
      console.log(`Logging in as ${decodedCredential.name}`);

      const user = await post("/api/login", { token: userToken });
      setUserId(user._id);

      // Initialize socket after successful login
      await post("/api/initsocket", { socketid: socket.id });

      return user; // Return the user for the Login component
    } catch (err) {
      console.error("Login failed:", err);
      throw err; // Propagate error to Login component
    }
  };

  const handleLogout = async () => {
    try {
      await post("/api/logout");
      setUserId(undefined);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const authContextValue = {
    userId,
    isLoading,
    handleLogin,
    handleLogout,
  };

  return (
    <UserContext.Provider value={authContextValue}>
      <Outlet />
    </UserContext.Provider>
  );
};

export default App;
