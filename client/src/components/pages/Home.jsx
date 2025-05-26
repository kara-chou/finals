import React, { useContext, useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import NavBar from "../modules/NavBar";
import { UserContext } from "../App";
import "../../utilities.css";
import "./Home.css";
import { get } from "../../utilities";

const ClassCard = ({ classInfo }) => {
  return (
    <div className="class-card">
      <h2>{classInfo.name}</h2>
      <p className="class-grade">Current Grade: {classInfo.currentGrade}%</p>
      <p className="class-goal">Goal: {classInfo.desiredGrade}%</p>
      <p className="class-final">Final Weight: {classInfo.finalWeight}%</p>
      <p className="class-needed">
        Needed on Final:{" "}
        {(
          (classInfo.desiredGrade -
            ((100 - classInfo.finalWeight) * classInfo.currentGrade) / 100) /
          (classInfo.finalWeight / 100)
        ).toFixed(2)}
        %
      </p>
    </div>
  );
};

const Home = () => {
  const { userId, isLoading } = useContext(UserContext);
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (userId) {
      get("/api/classes").then((classesData) => {
        setClasses(classesData);
      });
    }
  }, [userId]);

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
        <div className="home-header">
          <h1>Your Classes</h1>
          <button className="add-class-button" onClick={() => navigate("/classes")}>
            <i className="fas fa-plus"></i> Add Class
          </button>
        </div>
        <div className="classes-grid">
          {classes.length === 0 ? (
            <div className="no-classes">
              <p>No classes yet!</p>
              <p>Click the "Add Class" button to get started.</p>
            </div>
          ) : (
            classes.map((classInfo) => <ClassCard key={classInfo._id} classInfo={classInfo} />)
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
