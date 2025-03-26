
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TableEmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  filterActive?: boolean;
}

const TableEmptyState = ({ 
  message, 
  actionLabel, 
  onAction,
  filterActive = false 
}: TableEmptyStateProps) => {
  return (
    <div className="border rounded-md p-8 text-center">
      <p className="text-muted-foreground mb-4">
        {message}
      </p>
      {!filterActive && actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus className="mr-2 h-4 w-4" /> {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default TableEmptyState;
