import React, { useContext } from "react";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import "./NavBar.css";
import "../../utilities.css";

const NavBar = () => {
  const { handleLogout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    googleLogout();
    handleLogout();
    navigate("/");
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div onClick={handleLogoutClick} className="navbar-link" title="Logout">
          <i className="fas fa-sign-out-alt" aria-label="Logout"></i>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
