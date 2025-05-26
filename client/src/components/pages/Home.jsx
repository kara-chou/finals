import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import NavBar from "../modules/NavBar";
import { UserContext } from "../App";
import "../../utilities.css";
import "./Home.css";

const Home = () => {
  const { userId, isLoading } = useContext(UserContext);

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!userId) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <NavBar />
      <div className="home-container">
        <h1>Welcome to your Home Page!</h1>
      </div>
    </>
  );
};

export default Home;
