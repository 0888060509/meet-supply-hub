import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";

interface TableEmptyStateProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
  filterActive?: boolean;
}

export const TableEmptyState = ({
  message,
  actionLabel,
  onAction,
  filterActive
}: TableEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-3 bg-muted rounded-full mb-4">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {filterActive ? "Data not found" : "Data not available"}
      </h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        {message}
      </p>
      <Button onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}; 