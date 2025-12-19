import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Heart } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-light via-background to-lavender-light flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-primary fill-primary mx-auto mb-4 animate-pulse" />
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading our love universe...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
