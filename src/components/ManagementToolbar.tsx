<<<<<<< HEAD

import React, { ReactNode } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ManagementToolbarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  addButtonText?: string;
  onAddClick?: () => void;
  children?: ReactNode;
}

const ManagementToolbar = ({
  searchPlaceholder = "Search...",
=======
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ManagementToolbarProps {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  addButtonText: string;
  onAddClick: () => void;
  children?: React.ReactNode;
}

export const ManagementToolbar = ({
  searchPlaceholder,
>>>>>>> 388d334 (- CRUD for User maangement)
  searchValue,
  onSearchChange,
  addButtonText,
  onAddClick,
<<<<<<< HEAD
  children,
}: ManagementToolbarProps) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Top row: Search and Add button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder={searchPlaceholder} 
            value={searchValue} 
            onChange={(e) => onSearchChange(e.target.value)} 
          />
        </div>
        
        {addButtonText && onAddClick && (
          <Button onClick={onAddClick}>
            <Plus className="mr-2 h-4 w-4" /> {addButtonText}
          </Button>
        )}
      </div>
      
      {/* Bottom row: Filters */}
      {children && (
        <div className="flex flex-wrap gap-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default ManagementToolbar;
=======
  children
}: ManagementToolbarProps) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Button onClick={onAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          {addButtonText}
        </Button>
      </div>
      <div className="flex gap-2">
        {children}
      </div>
    </div>
  );
}; 
>>>>>>> 388d334 (- CRUD for User maangement)
