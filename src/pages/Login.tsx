
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // If user is already authenticated, redirect to the intended page or dashboard
  if (isAuthenticated && !isLoading) {
    const from = (location.state as any)?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-accent/10">
      <div className="w-full max-w-md">
        <Card className="border-accent/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              WorkspaceHub
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-center text-muted-foreground">
              <p>Demo Accounts:</p>
              <p>Employee: employee / employee</p>
              <p>Admin: admin / admin</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
