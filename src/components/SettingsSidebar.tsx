<<<<<<< HEAD

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  Calendar, 
  Users, 
  Clipboard, 
  Boxes,
  Layout
} from "lucide-react";

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
      icon: <Layout className="h-5 w-5" /> 
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
      icon: <Boxes className="h-5 w-5" /> 
    }
  ];

  return (
    <div className="md:w-64 bg-sidebar border-r border-accent/20 md:min-h-[calc(100vh-64px)] hidden md:block sticky top-16 h-[calc(100vh-64px)] animate-fade-in">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <nav className="flex flex-col space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                location.pathname === link.path || location.pathname.startsWith(`${link.path}/`)
                  ? "bg-accent text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
              )}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
=======
import { Users, Settings, Key, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "User Management",
    icon: Users,
    href: "/settings/users"
  },
  {
    title: "Roles & Permissions",
    icon: Shield,
    href: "/settings/roles"
  },
  {
    title: "Security",
    icon: Key,
    href: "/settings/security"
  },
  {
    title: "General Settings",
    icon: Settings,
    href: "/settings/general"
  }
];

export const SettingsSidebar = () => {
  return (
    <div className="w-64 border-r bg-background">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => {
                  return cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#F9F5FF] text-[#6941C6]"
                      : "text-[#667085] hover:bg-gray-50 hover:text-[#101828]"
                  );
                }}
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-[#6941C6]" : "text-[#667085]"
                      )} 
                    />
                    <span>{item.title}</span>
                  </>
                )}
              </NavLink>
            );
          })}
>>>>>>> 388d334 (- CRUD for User maangement)
        </nav>
      </div>
    </div>
  );
<<<<<<< HEAD
};

export default SettingsSidebar;
=======
}; 
>>>>>>> 388d334 (- CRUD for User maangement)
