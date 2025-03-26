
import React, { ReactNode } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminManagementToolbarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  addButtonText?: string;
  onAddClick?: () => void;
  children?: ReactNode;
  clearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function AdminManagementToolbar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  addButtonText,
  onAddClick,
  children,
  clearFilters,
  hasActiveFilters = false,
}: AdminManagementToolbarProps) {
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
        <div className="flex flex-wrap items-center gap-2">
          {children}
          
          {hasActiveFilters && clearFilters && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="ml-auto"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
