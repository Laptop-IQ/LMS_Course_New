import { Navigate } from "react-router-dom";
import { getData } from "@/context/userContext";

const ProtectedRoute = ({ children }) => {
  const { user } = getData();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
