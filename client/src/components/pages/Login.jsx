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
      <div className="login-content">
        <h1>Welcome!</h1>
        <p>Please sign in with your Google account to continue.</p>

        {error && <div className="login-error">{error}</div>}

        <div className="google-login-container">
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
