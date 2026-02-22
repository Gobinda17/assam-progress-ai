import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Login from "../pages/login/page";
import ResetPassword from "../pages/reset-password/page";
import Dashboard from "../pages/dashboard/page";
import Register from "../pages/register/page";
import ProfilePage from "../pages/dashboard/profile/page";
import UserManagementPage from "../pages/dashboard/users/page";
import ChatPage from "../pages/chat/page";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
        <UserManagementPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
