import React, { useContext } from "react";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserContext, ThemeContext } from "../App";
import "./NavBar.css";
import "../../utilities.css";

const NavBar = () => {
  const { handleLogout } = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    googleLogout();
    handleLogout();
    navigate("/");
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div onClick={() => navigate("/home")} className="navbar-brand">
          <img src="/favicon.svg" alt="Calculator" className="navbar-logo" />
          <span className="navbar-title">Final Grade Calculator</span>
        </div>
        <div className="navbar-links">
          <div
            onClick={toggleTheme}
            className="navbar-link"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <i
              className={`fas fa-${theme === "dark" ? "sun" : "moon"}`}
              aria-label="Toggle theme"
            ></i>
          </div>
          <div onClick={handleLogoutClick} className="navbar-link" title="Logout">
            <i className="fas fa-sign-out-alt" aria-label="Logout"></i>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
