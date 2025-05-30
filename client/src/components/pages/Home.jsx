import React, { useContext, useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import NavBar from "../modules/NavBar";
import { UserContext } from "../App";
import "../../utilities.css";
import "./Home.css";
import { get, del } from "../../utilities";

const ClassCard = ({ classInfo, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      setIsDeleting(true);
      try {
        await del(`/api/classes/${classInfo._id}`);
        onDelete(classInfo._id);
      } catch (err) {
        console.error("Failed to delete class:", err);
        alert("Failed to delete class. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/classes/${classInfo._id}`);
  };

  const neededGrade = Math.max(
    0,
    (classInfo.desiredGrade - ((100 - classInfo.finalWeight) * classInfo.currentGrade) / 100) /
      (classInfo.finalWeight / 100)
  ).toFixed(2);

  return (
    <div className="class-card">
      <div className="card-actions">
        <button className="edit-button" onClick={handleEdit} title="Edit Class">
          <i className="fas fa-pencil-alt"></i>
        </button>
        <button
          className="delete-button"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete Class"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
      <h2>{classInfo.name}</h2>
      <p className="class-goal">{classInfo.desiredGrade}%</p>
      <p className="class-grade">{classInfo.currentGrade}%</p>
      <p className="class-needed">
        <span>{neededGrade}%</span>
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
      // Wait a bit for the session to be fully established
      const timer = setTimeout(() => {
        get("/api/classes")
          .then((classesData) => {
            setClasses(classesData);
          })
          .catch((error) => {
            console.error("Failed to fetch classes:", error);
          });
      }, 300); // 300ms delay

      return () => clearTimeout(timer);
    }
  }, [userId]);

  const handleDelete = (deletedId) => {
    setClasses((prevClasses) => prevClasses.filter((c) => c._id !== deletedId));
  };

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
            classes.map((classInfo) => (
              <ClassCard key={classInfo._id} classInfo={classInfo} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
