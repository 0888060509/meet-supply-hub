
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Settings, Calendar, Users, Package, Clipboard } from "lucide-react";

interface SidebarLink {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const SettingsSidebar = () => {
  const location = useLocation();
  
  const sidebarLinks: SidebarLink[] = [
    { 
      name: "Room Management", 
      path: "/admin/rooms", 
      icon: <Settings className="h-5 w-5" /> 
    },
    { 
      name: "All Bookings", 
      path: "/admin/bookings", 
      icon: <Calendar className="h-5 w-5" /> 
    },
    { 
      name: "User Management", 
      path: "/admin/users", 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      name: "Stationery Management", 
      path: "/admin/stationery", 
      icon: <Clipboard className="h-5 w-5" /> 
    },
    { 
      name: "Inventory Management", 
      path: "/admin/inventory", 
      icon: <Package className="h-5 w-5" /> 
    }
  ];

  return (
    <div className="md:w-64 bg-sidebar border-r border-accent/20 h-full hidden md:block animate-fade-in">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <nav className="flex flex-col space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                location.pathname === link.path
                  ? "bg-accent text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
              )}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SettingsSidebar;
