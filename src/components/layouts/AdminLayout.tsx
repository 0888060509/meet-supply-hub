
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SettingsSidebar from "@/components/SettingsSidebar";
import { LucideIcon } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function AdminLayout({ 
  children, 
  title,
  description,
  icon: Icon 
}: AdminLayoutProps) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if not an admin
  if (!isAdmin) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold">Unauthorized Access</h1>
        <p className="text-muted-foreground mt-2">
          You do not have permission to access this page.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <SettingsSidebar />
      <div className="flex-1 p-6 md:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-8">
            {Icon && <Icon className="h-8 w-8 mr-4 text-primary" />}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
