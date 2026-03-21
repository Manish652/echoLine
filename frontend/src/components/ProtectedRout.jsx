import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>Checking authentication...</p>
      </div>
    );
  }
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
