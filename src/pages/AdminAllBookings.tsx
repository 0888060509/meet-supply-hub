
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SettingsSidebar from "@/components/SettingsSidebar";

const AdminAllBookings = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <SettingsSidebar />
      <div className="flex-1 p-6 md:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack} 
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">All Bookings</h1>
              <p className="text-muted-foreground mt-1">
                Manage all bookings across your organization
              </p>
            </div>
          </div>
          
          {/* Bookings content goes here */}
          <div className="border rounded-md p-8 text-center">
            <p className="text-muted-foreground">
              Bookings content will be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAllBookings;
