import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import jwt_decode from "jwt-decode";

import "../utilities.css";

import { socket } from "../client-socket";

import { get, post } from "../utilities";

export const UserContext = React.createContext({});
export const ThemeContext = React.createContext({});

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

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

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <UserContext.Provider value={{ userId, isLoading, handleLogin, handleLogout }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <Outlet />
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
};

export default App;
