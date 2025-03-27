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
  searchValue,
  onSearchChange,
  addButtonText,
  onAddClick,
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
