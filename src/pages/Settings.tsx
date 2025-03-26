
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Settings, Users, Clipboard, Calendar, Package, Menu, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import SettingsSidebar from "@/components/SettingsSidebar";
import { cn } from "@/lib/utils";

const SettingsPage = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  useEffect(() => {
    // Show toast if non-admin tries to access this page
    if (!isAdmin) {
      toast.error("You don't have permission to access the Settings page");
    }
    
    // Close mobile sidebar when route changes
    setIsMobileSidebarOpen(false);
  }, [isAdmin, location.pathname]);
  
  // Redirect non-admins to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      title: "Room Management",
      description: "Add new rooms, edit existing ones, and manage room equipment and availability.",
      icon: <Settings className="h-5 w-5 text-primary" />,
      path: "/admin/rooms"
    },
    {
      title: "All Bookings",
      description: "View, search, and manage all room bookings across the organization.",
      icon: <Calendar className="h-5 w-5 text-primary" />,
      path: "/admin/bookings"
    },
    {
      title: "User Management",
      description: "Add, edit, and manage user accounts. Control access and permissions across the platform.",
      icon: <Users className="h-5 w-5 text-primary" />,
      path: "/admin/users"
    },
    {
      title: "Stationery Management",
      description: "Add, edit, and manage stationery items. Keep track of inventory and stock levels.",
      icon: <Clipboard className="h-5 w-5 text-primary" />,
      path: "/admin/stationery"
    },
    {
      title: "Inventory Management",
      description: "Manage stock levels, approve requests, and track usage patterns.",
      icon: <Package className="h-5 w-5 text-primary" />,
      path: "/admin/inventory"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row animate-fade-in pt-0">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <Button 
          size="icon"
          variant="default"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="rounded-full shadow-lg"
        >
          {isMobileSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>
      
      {/* Mobile Sidebar */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity md:hidden",
          isMobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileSidebarOpen(false)}
      >
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-accent/20 p-4 transition-transform duration-300 ease-in-out",
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <nav className="flex flex-col space-y-1">
            {features.map((feature) => (
              <Link
                key={feature.path}
                to={feature.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  location.pathname === feature.path
                    ? "bg-accent text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
                )}
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                {feature.icon}
                <span>{feature.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Desktop Sidebar */}
      <SettingsSidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your workspace resources and user permissions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-md transition-shadow border-primary/20 hover-scale">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {feature.icon} {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild variant="default" className="w-full">
                    <Link to={feature.path}>Manage {feature.title.split(' ')[0]}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
