
import React, { ReactNode } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import TableEmptyState from "@/components/TableEmptyState";

interface AdminTableProps {
  columns: {
    key: string;
    header: string;
    width?: string;
  }[];
  data: any[];
  renderRow: (item: any) => ReactNode;
  emptyStateMessage: string;
  emptyStateActionLabel?: string;
  onEmptyStateAction?: () => void;
  isFilterActive?: boolean;
}

export function AdminTable({
  columns,
  data,
  renderRow,
  emptyStateMessage,
  emptyStateActionLabel,
  onEmptyStateAction,
  isFilterActive = false,
}: AdminTableProps) {
  return (
    <div className="border rounded-md shadow-sm overflow-hidden">
      {data.length === 0 ? (
        <TableEmptyState
          message={emptyStateMessage}
          actionLabel={emptyStateActionLabel}
          onAction={onEmptyStateAction}
          filterActive={isFilterActive}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} width={column.width}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(renderRow)}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
