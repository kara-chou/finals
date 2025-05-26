import React, { useState, useContext, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../App";
import NavBar from "../modules/NavBar";
import { get, post, put } from "../../utilities";
import "./Classes.css";

const Classes = () => {
  const { userId, isLoading } = useContext(UserContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    currentGrade: "",
    desiredGrade: "",
    finalWeight: "",
  });
  const [error, setError] = useState("");
  const [isLoading2, setIsLoading2] = useState(false);

  useEffect(() => {
    const fetchClass = async () => {
      if (id) {
        setIsLoading2(true);
        try {
          const classData = await get(`/api/classes/${id}`);
          setFormData({
            name: classData.name,
            currentGrade: classData.currentGrade,
            desiredGrade: classData.desiredGrade,
            finalWeight: classData.finalWeight,
          });
        } catch (err) {
          console.error("Error fetching class:", err);
          setError("Failed to load class data");
          navigate("/home");
        } finally {
          setIsLoading2(false);
        }
      }
    };

    fetchClass();
  }, [id, navigate]);

  // Add event listener to prevent scroll on inputs
  useEffect(() => {
    const inputs = document.querySelectorAll('input[type="text"]');

    const preventScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    inputs.forEach((input) => {
      input.addEventListener("wheel", preventScroll, { passive: false });
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("wheel", preventScroll);
      });
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    const numericFields = ["currentGrade", "desiredGrade", "finalWeight"];
    for (const field of numericFields) {
      const value = parseFloat(formData[field]);
      if (isNaN(value) || value < 0 || value > 100) {
        setError(`${field.replace(/([A-Z])/g, " $1").toLowerCase()} must be between 0 and 100`);
        return;
      }
    }

    try {
      if (id) {
        await put(`/api/classes/${id}`, formData);
      } else {
        await post("/api/classes", formData);
      }
      navigate("/home");
    } catch (err) {
      setError(`Failed to ${id ? "update" : "create"} class. Please try again.`);
      console.error(`Error ${id ? "updating" : "creating"} class:`, err);
    }
  };

  if (isLoading || isLoading2) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!userId) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <NavBar />
      <div className="classes-container">
        <div className="classes-content">
          <h1>{id ? "Edit Class" : "Add Class"}</h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Class Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., 18.06"
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label htmlFor="currentGrade">Current Grade (%)</label>
              <input
                type="number"
                id="currentGrade"
                name="currentGrade"
                value={formData.currentGrade}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="any"
                placeholder="e.g., 85"
              />
            </div>
            <div className="form-group">
              <label htmlFor="desiredGrade">Desired Grade (%)</label>
              <input
                type="number"
                id="desiredGrade"
                name="desiredGrade"
                value={formData.desiredGrade}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="any"
                placeholder="e.g., 90"
              />
            </div>
            <div className="form-group">
              <label htmlFor="finalWeight">Final Weight (%)</label>
              <input
                type="number"
                id="finalWeight"
                name="finalWeight"
                value={formData.finalWeight}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="any"
                placeholder="e.g., 20"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={() => navigate("/home")}>
                Cancel
              </button>
              <button type="submit" className="submit-button">
                {id ? "Save Changes" : "Add Class"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Classes;
