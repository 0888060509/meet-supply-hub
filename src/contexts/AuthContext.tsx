
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Define user types and roles
export type UserRole = "employee" | "admin";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

// Hardcoded users as requested
const USERS = [
  {
    id: "1",
    username: "employee",
    password: "employee",
    name: "Employee User",
    role: "employee" as UserRole,
  },
  {
    id: "2",
    username: "admin",
    password: "admin",
    name: "Admin User",
    role: "admin" as UserRole,
  }
];

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user with matching credentials
    const matchedUser = USERS.find(
      u => u.username === username && u.password === password
    );
    
    setIsLoading(false);
    
    if (matchedUser) {
      // Create a user object without the password
      const { password: _, ...safeUser } = matchedUser;
      setUser(safeUser);
      
      // Store in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(safeUser));
      
      toast.success(`Welcome, ${safeUser.name}!`);
      return true;
    } else {
      toast.error("Invalid username or password");
      return false;
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("You have been logged out");
    navigate("/login");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        logout, 
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
