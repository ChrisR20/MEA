import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isSessionValid } from "../utils/session";

const ProtectedRoute = () => {
  const authenticated =
    localStorage.getItem("isAuthenticated") === "true" && isSessionValid();

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
