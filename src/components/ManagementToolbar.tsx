
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
  searchValue,
  onSearchChange,
  addButtonText,
  onAddClick,
  children,
}: ManagementToolbarProps) => {
  return (
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-6">
      <div className="flex w-full justify-between items-center mb-2 md:mb-0">
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
          <Button className="ml-2" onClick={onAddClick}>
            <Plus className="mr-2 h-4 w-4" /> {addButtonText}
          </Button>
        )}
      </div>
      
      {children && (
        <div className="flex flex-wrap gap-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default ManagementToolbar;
