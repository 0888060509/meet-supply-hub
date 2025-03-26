import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SettingsSidebar from "@/components/SettingsSidebar";
const StationeryManagement = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };
  return <div className="flex min-h-[calc(100vh-64px)]">
      <SettingsSidebar />
      <div className="flex-1 p-6 md:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Stationery Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage your organization's stationery inventory
              </p>
            </div>
          </div>
          
          {/* Stationery content goes here */}
          <div className="border rounded-md p-8 text-center">
            <p className="text-muted-foreground">
              Stationery management content will be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default StationeryManagement;