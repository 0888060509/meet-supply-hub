import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Users, Shield, KeyRound, Settings2, PanelsTopLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SettingsPage = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    {
      title: "Room Management",
      icon: <PanelsTopLeft className="h-5 w-5" />,
      path: "/admin/rooms"
    },
    {
      title: "User Management",
      icon: <Users className="h-5 w-5" />,
      path: "/admin/users"
    },
    {
      title: "Roles & Permissions",
      icon: <Shield className="h-5 w-5" />,
      path: "/admin/roles"
    },
    {
      title: "Security",
      icon: <KeyRound className="h-5 w-5" />,
      path: "/admin/security"
    },
    {
      title: "General Settings",
      icon: <Settings2 className="h-5 w-5" />,
      path: "/admin/general"
    }
  ];
  
  useEffect(() => {
    if (!isAdmin) {
      toast.error("You don't have permission to access this page");
      return;
    }

    // Redirect to Room Management if on base admin path
    if (location.pathname === "/admin") {
      navigate("/admin/rooms");
    }
  }, [isAdmin, location.pathname, navigate]);
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="w-72 min-h-screen border-r bg-white">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Settings</h2>
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  location.pathname === item.path 
                    ? "bg-accent text-primary font-medium"
                    : "text-gray-500 hover:bg-gray-50"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Children components will be rendered here */}
      </div>
    </div>
  );
};

export default SettingsPage;
