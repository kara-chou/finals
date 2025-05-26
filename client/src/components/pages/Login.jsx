import React, { useContext, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Navigate } from "react-router-dom";
import { UserContext } from "../App";
import "../../utilities.css";
import "./Login.css";

const Login = () => {
  const { userId, isLoading, handleLogin } = useContext(UserContext);
  const [error, setError] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [currentGrade, setCurrentGrade] = useState("");
  const [desiredGrade, setDesiredGrade] = useState("");
  const [finalWeight, setFinalWeight] = useState("");

  const calculateNeededGrade = () => {
    if (!currentGrade || !desiredGrade || !finalWeight) {
      return "N/A";
    }

    const current = parseFloat(currentGrade);
    const desired = parseFloat(desiredGrade);
    const weight = parseFloat(finalWeight);

    if (isNaN(current) || isNaN(desired) || isNaN(weight) || weight === 0) {
      return "N/A";
    }

    const needed = (desired - ((100 - weight) * current) / 100) / (weight / 100);
    return needed.toFixed(2) + "%";
  };

  const handleSuccess = async (credentialResponse) => {
    try {
      setLoginInProgress(true);
      setError("");
      await handleLogin(credentialResponse);
    } catch (err) {
      setError("Failed to log in. Please try again.");
      console.error("Login Error:", err);
    } finally {
      setLoginInProgress(false);
    }
  };

  const handleError = (err) => {
    setError("Google login failed. Please try again.");
    console.error("Google Login Error:", err);
  };

  // Show loading state while checking auth
  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  // Redirect to home if already logged in
  if (userId) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="login-container">
      <div className="login-title">Final Grade Calculator</div>

      {/* Basic Calculator */}
      <div className="calculator-content">
        <div className="input-row">
          <p>Current Grade: </p>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="(e.g. 85)"
            value={currentGrade}
            onChange={(e) => setCurrentGrade(e.target.value)}
          />
          <span>%</span>
        </div>
        <div className="input-row">
          <p>Desired Grade: </p>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="(e.g. 90)"
            value={desiredGrade}
            onChange={(e) => setDesiredGrade(e.target.value)}
          />
          <span>%</span>
        </div>
        <div className="input-row">
          <p>Weight of Final: </p>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="(e.g. 20)"
            value={finalWeight}
            onChange={(e) => setFinalWeight(e.target.value)}
          />
          <span>%</span>
        </div>
        <div className="final-display">
          <p>Needed on Final: </p>
          <span>{calculateNeededGrade()}</span>
        </div>
      </div>

      {/* Google Login Box */}
      <div className="google-login-container">
        <p>Sign in to save your grades.</p>
        {error && <div className="login-error">{error}</div>}
        <div>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            disabled={loginInProgress}
          />
        </div>

        {loginInProgress && <div className="login-loading">Logging you in...</div>}
      </div>
    </div>
  );
};

export default Login;
