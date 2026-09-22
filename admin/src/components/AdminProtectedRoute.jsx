import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminAccessToken");
  const user = localStorage.getItem("adminUser");

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  // children = DashboardLayout (jo Outlet render karta hai)
  return children;
};

export default AdminProtectedRoute;
