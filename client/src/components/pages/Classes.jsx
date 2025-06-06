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
  const [classData, setClassData] = useState({
    name: "",
    currentGrade: "",
    desiredGrade: "",
    finalWeight: "",
    isUsingCategories: false,
    categories: [
      {
        name: "",
        weight: "",
        weightValue: "",
        cutoff: "",
        cutoffValue: "",
        grade: "",
        gradeValue: "",
      },
    ],
  });
  const [error, setError] = useState("");
  const [isLoading2, setIsLoading2] = useState(false);

  // Convenience accessors
  const useCategories = classData.isUsingCategories;
  const categories = classData.categories;

  const setUseCategories = (value) => {
    console.log("Switching to:", value ? "categories" : "direct input"); // Debug log
    setClassData((prev) => ({
      ...prev,
      isUsingCategories: value,
    }));
  };

  const setCategories = (newCategories) => {
    console.log("Updating categories:", newCategories); // Debug log
    setClassData((prev) => ({
      ...prev,
      categories: newCategories,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClassData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchClass = async () => {
      if (id) {
        setIsLoading2(true);
        try {
          const data = await get(`/api/classes/${id}`);
          console.log("Fetched class data:", data); // Debug log

          // Set the entire class data
          setClassData({
            name: data.name || "",
            currentGrade: data.currentGrade || "",
            desiredGrade: data.desiredGrade || "",
            finalWeight: data.finalWeight || "",
            isUsingCategories: data.isUsingCategories || false,
            categories: data.categories || [
              {
                name: "",
                weight: "",
                weightValue: "",
                cutoff: "",
                cutoffValue: "",
                grade: "",
                gradeValue: "",
              },
            ],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Create the submission data with all the information
    const submissionData = {
      ...classData,
      // Ensure we're sending the current calculation method and categories
      isUsingCategories: classData.isUsingCategories,
      categories: classData.categories,
      // Update the current grade based on calculation method
      currentGrade: classData.isUsingCategories ? calculateCurrentGrade() : classData.currentGrade,
    };

    console.log("Submitting class data:", submissionData); // Debug log

    // Validate inputs
    const numericFields = ["currentGrade", "desiredGrade", "finalWeight"];
    for (const field of numericFields) {
      const value = parseFloat(submissionData[field]);
      if (isNaN(value) || value < 0 || value > 100) {
        setError(`${field.replace(/([A-Z])/g, " $1").toLowerCase()} must be between 0 and 100`);
        return;
      }
    }

    try {
      let response;
      if (id) {
        response = await put(`/api/classes/${id}`, submissionData);
      } else {
        response = await post("/api/classes", submissionData);
      }
      console.log("Save response:", response); // Debug log
      navigate("/home");
    } catch (err) {
      setError(`Failed to ${id ? "update" : "create"} class. Please try again.`);
      console.error(`Error ${id ? "updating" : "creating"} class:`, err);
    }
  };

  // Update the category change handler
  const handleCategoryChange = (index, field, value) => {
    const newCategories = [...categories];
    newCategories[index][field] = value;

    // If it's a grade, weight, or cutoff field, try to evaluate the expression
    if (field === "grade" || field === "weight" || field === "cutoff") {
      const evaluated = evaluateExpression(value);
      if (evaluated !== "") {
        newCategories[index][field] = value; // Keep the original input
        newCategories[index][`${field}Value`] = evaluated; // Store the calculated value
      } else {
        newCategories[index][`${field}Value`] = "";
      }
    }

    // If changing cutoff and it's empty, use desired grade
    if (field === "cutoff" && !value && classData.desiredGrade) {
      newCategories[index].cutoff = "";
      newCategories[index].cutoffValue = classData.desiredGrade;
    }

    // Update the categories in classData
    setClassData((prev) => ({
      ...prev,
      categories: newCategories,
    }));
  };

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        name: "",
        weight: "",
        weightValue: "",
        cutoff: "",
        cutoffValue: "",
        grade: "",
        gradeValue: "",
      },
    ]);
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const calculateCurrentGrade = () => {
    const validCategories = categories.filter(
      (cat) =>
        cat.weightValue &&
        cat.gradeValue &&
        !isNaN(parseFloat(cat.weightValue)) &&
        !isNaN(parseFloat(cat.gradeValue))
    );

    if (validCategories.length === 0) return "";

    const totalWeight = validCategories.reduce((sum, cat) => sum + parseFloat(cat.weightValue), 0);

    const weightedSum = validCategories.reduce(
      (sum, cat) => sum + parseFloat(cat.weightValue) * parseFloat(cat.gradeValue),
      0
    );

    return (weightedSum / totalWeight).toFixed(2);
  };

  const calculateWeightedDesiredGrade = () => {
    if (!useCategories) {
      return parseFloat(classData.desiredGrade);
    }

    // Get categories with valid weights and cutoffs
    const validCategories = categories.filter(
      (cat) => cat.weightValue && !isNaN(parseFloat(cat.weightValue))
    );

    if (validCategories.length === 0) {
      return parseFloat(classData.desiredGrade);
    }

    const defaultCutoff = parseFloat(classData.desiredGrade);
    let totalWeightedCutoff = 0;
    let totalWeight = 0;

    // Calculate for categories with specific cutoffs
    validCategories.forEach((cat) => {
      const weight = parseFloat(cat.weightValue);
      const cutoff = cat.cutoffValue ? parseFloat(cat.cutoffValue) : defaultCutoff;

      totalWeightedCutoff += (weight / 100) * cutoff;
      totalWeight += weight;
    });

    // Add in the remaining weight with default cutoff
    const remainingWeight = 100 - totalWeight;
    if (remainingWeight > 0) {
      totalWeightedCutoff += (remainingWeight / 100) * defaultCutoff;
    }

    return totalWeightedCutoff;
  };

  const calculateNeededGrade = () => {
    const current = parseFloat(useCategories ? calculateCurrentGrade() : classData.currentGrade);
    const weight = parseFloat(classData.finalWeight);
    const desired = calculateWeightedDesiredGrade();

    if (isNaN(current) || isNaN(desired) || isNaN(weight) || weight === 0) {
      return "N/A";
    }

    const needed = (desired - ((100 - weight) * current) / 100) / (weight / 100);
    return Math.max(0, needed).toFixed(2) + "%";
  };

  const evaluateExpression = (expr) => {
    if (!expr || expr.trim() === "") return "";

    try {
      // Handle fractions (e.g., "19/20")
      if (expr.includes("/")) {
        const [numerator, denominator] = expr.split("/").map((part) => part.trim());
        if (denominator === "0") return "";
        return ((parseFloat(numerator) / parseFloat(denominator)) * 100).toFixed(2);
      }

      // Handle basic arithmetic
      // Replace any unsafe characters
      const sanitized = expr.replace(/[^0-9+\-*/.() ]/g, "");
      // Use Function instead of eval for better safety
      const result = new Function(`return ${sanitized}`)();
      return isNaN(result) ? "" : result.toFixed(2);
    } catch (error) {
      return "";
    }
  };

  const getDefaultCutoffPlaceholder = (desiredGrade) => {
    if (!desiredGrade) return "e.g., 90 or 18/20";
    const decimal = (parseFloat(desiredGrade) / 100).toFixed(2);
    return `Default: ${desiredGrade} or ${decimal}`;
  };

  // Add event listener to prevent scroll on category table inputs
  useEffect(() => {
    // Only target inputs within the categories table
    const categoryInputs = document.querySelectorAll('.categories-table input[type="text"]');

    const preventScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    categoryInputs.forEach((input) => {
      input.addEventListener("wheel", preventScroll, { passive: false });
    });

    return () => {
      categoryInputs.forEach((input) => {
        input.removeEventListener("wheel", preventScroll);
      });
    };
  }, []);

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
                value={classData.name}
                onChange={handleChange}
                required
                placeholder="e.g., 18.06"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="desiredGrade">Desired Grade (%)</label>
              <input
                type="number"
                id="desiredGrade"
                name="desiredGrade"
                value={classData.desiredGrade}
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
                value={classData.finalWeight}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="any"
                placeholder="e.g., 20"
              />
            </div>

            <div className="form-group">
              <div className="grade-controls">
                <div className="grade-header">
                  <label>{!useCategories ? "Current Grade (%)" : "Current Grade"}</label>
                  <div className="curr-container">
                    <div className="toggle-buttons">
                      <button
                        type="button"
                        className={!useCategories ? "active" : ""}
                        onClick={() => setUseCategories(false)}
                      >
                        Direct Input
                      </button>
                      <button
                        type="button"
                        className={useCategories ? "active" : ""}
                        onClick={() => setUseCategories(true)}
                      >
                        Use Categories
                      </button>
                    </div>

                    {!useCategories ? (
                      <div className="form-group needed">
                        <input
                          type="number"
                          id="currentGrade"
                          name="currentGrade"
                          value={classData.currentGrade}
                          onChange={handleChange}
                          required
                          min="0"
                          max="100"
                          step="any"
                          placeholder="e.g., 85"
                        />
                      </div>
                    ) : (
                      <div className="categories-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Category</th>
                              <th>Weight</th>
                              <th>Grade</th>
                              <th>A Cutoff</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {categories.map((category, index) => (
                              <tr key={index}>
                                <td>
                                  <input
                                    type="text"
                                    value={category.name}
                                    onChange={(e) =>
                                      handleCategoryChange(index, "name", e.target.value)
                                    }
                                    placeholder="e.g., Midterm"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    value={category.weight}
                                    onChange={(e) =>
                                      handleCategoryChange(index, "weight", e.target.value)
                                    }
                                    placeholder="e.g., 30 or 3/10"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    value={category.grade}
                                    onChange={(e) =>
                                      handleCategoryChange(index, "grade", e.target.value)
                                    }
                                    placeholder="e.g., 85 or 17/20"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    value={category.cutoff}
                                    onChange={(e) =>
                                      handleCategoryChange(index, "cutoff", e.target.value)
                                    }
                                    placeholder={getDefaultCutoffPlaceholder(
                                      classData.desiredGrade
                                    )}
                                    className={!category.cutoff ? "default-cutoff" : ""}
                                  />
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="remove-category"
                                    onClick={() => removeCategory(index)}
                                    title="Remove category"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <button type="button" className="add-category" onClick={addCategory}>
                          <i className="fas fa-plus"></i> Add Category
                        </button>
                        <div className="calculated-grade">
                          Current Grade: {calculateCurrentGrade() || "N/A"}
                          {calculateCurrentGrade() && "%"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="calculator-result">
              <h2>Needed on Final</h2>
              <div className="needed-grade">{calculateNeededGrade()}</div>
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
