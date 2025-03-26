
import React, { useState } from "react";
import { Package, Boxes } from "lucide-react";
import SettingsSidebar from "@/components/SettingsSidebar";
import ManagementHeader from "@/components/ManagementHeader";
import ManagementToolbar from "@/components/ManagementToolbar";
import TableEmptyState from "@/components/TableEmptyState";

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <SettingsSidebar />
      <div className="flex-1 p-6 md:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <ManagementHeader
            title="Inventory Management"
            description="Manage your organization's inventory items"
            icon={Boxes}
          />

          <ManagementToolbar
            searchPlaceholder="Search inventory items..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            addButtonText="Add Item"
            onAddClick={() => {}}
          />
          
          <TableEmptyState
            message="Inventory management functionality will be implemented soon."
            actionLabel="Add Item"
            onAction={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
