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
        </nav>
      </div>
    </div>
  );
};
