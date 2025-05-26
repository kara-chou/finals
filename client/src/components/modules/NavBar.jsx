import React, { useContext } from "react";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import "./NavBar.css";
import "../../utilities.css";
import { useState } from "react";

const NavBar = () => {
  const { handleLogout } = useContext(UserContext);

  const navigate = useNavigate();

  const handleLogoutClick = () => {
    googleLogout();
    handleLogout();
    navigate("/");
  };

  return (
    <div className="navbar-container">
      <div onClick={handleLogoutClick} className="navbar-link">
        Logout Button
      </div>
    </div>
  );
};

export default NavBar;
