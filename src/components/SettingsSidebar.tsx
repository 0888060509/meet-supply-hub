import { Users, Calendar, Clipboard, PanelsTopLeft, Package } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Room Management",
    icon: PanelsTopLeft,
    href: "/admin/rooms"
  },
  {
    title: "All Bookings",
    icon: Calendar,
    href: "/admin/bookings"
  },
  {
    title: "User Management",
    icon: Users,
    href: "/admin/users"
  },
  {
    title: "Stationery Management",
    icon: Clipboard,
    href: "/admin/stationery"
  },
  {
    title: "Inventory Management",
    icon: Package,
    href: "/admin/inventory"
  }
];

export const SettingsSidebar = () => {
  return (
    <div className="md:w-64 bg-sidebar border-r border-accent/20 md:min-h-[calc(100vh-64px)] hidden md:block sticky top-16 h-[calc(100vh-64px)] animate-fade-in">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => {
                  return cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
                  );
                }}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
