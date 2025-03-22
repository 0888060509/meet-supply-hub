
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const location = useLocation();
  
  // Show loading state or placeholder while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-accent mb-4"></div>
          <div className="h-4 w-40 bg-accent rounded"></div>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If route requires admin privileges and user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // User is authenticated and has proper permissions
  return <>{children}</>;
};

export default ProtectedRoute;
