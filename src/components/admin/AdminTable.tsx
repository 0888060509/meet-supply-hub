
import React, { ReactNode, useMemo, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import TableEmptyState from "@/components/TableEmptyState";
import { ArrowUp, ArrowDown, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminTablePagination } from "./AdminTablePagination";
import { AdminLoadingSpinner } from "./AdminLoadingSpinner";

export type SortDirection = "asc" | "desc" | null;
export type SortConfig = {
  key: string;
  direction: SortDirection;
};

export interface AdminTableColumn {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  hideOnMobile?: boolean;
}

export interface AdminTableProps {
  columns: AdminTableColumn[];
  data: any[];
  renderRow: (item: any, index: number) => ReactNode;
  emptyStateMessage: string;
  emptyStateActionLabel?: string;
  onEmptyStateAction?: () => void;
  isFilterActive?: boolean;
  isLoading?: boolean;
  error?: string | null;
  sortable?: boolean;
  initialSort?: SortConfig;
  onSort?: (sortConfig: SortConfig) => void;
  clientSideSort?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function AdminTable({
  columns,
  data,
  renderRow,
  emptyStateMessage,
  emptyStateActionLabel,
  onEmptyStateAction,
  isFilterActive = false,
  isLoading = false,
  error = null,
  sortable = false,
  initialSort,
  onSort,
  clientSideSort = false,
  pagination,
}: AdminTableProps) {
  const isMobile = useIsMobile();
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort || null);

  // Handle column sorting
  const handleSort = (key: string) => {
    if (!sortable) return;
    
    let direction: SortDirection = "asc";
    
    if (sortConfig?.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null;
      }
    }
    
    const newSortConfig = direction ? { key, direction } : null;
    setSortConfig(newSortConfig);
    
    if (onSort) {
      onSort(newSortConfig as SortConfig);
    }
  };

  // Handle client-side sorting if enabled
  const sortedData = useMemo(() => {
    if (!clientSideSort || !sortConfig || !sortConfig.direction) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });
  }, [data, sortConfig, clientSideSort]);

  // Determine which data to use based on sort settings
  const displayData = clientSideSort ? sortedData : data;

  // Show error state if there is an error
  if (error) {
    return (
      <div className="border rounded-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <CircleAlert className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium mb-2">Error loading data</p>
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  // Show skeleton loading state
  if (isLoading) {
    return (
      <div className="border rounded-md overflow-hidden animate-fade-in">
        <div className="h-12 bg-muted/30 flex items-center px-4 border-b">
          <div className="flex w-full">
            {columns.filter(col => !isMobile || !col.hideOnMobile).map((column, index) => (
              <div 
                key={column.key} 
                className={cn(
                  "h-4", 
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  index === columns.length - 1 ? "ml-auto" : "mr-3"
                )}
                style={{ width: column.width || "auto" }}
              >
                <Skeleton className="h-4 w-3/4 bg-muted/50" />
              </div>
            ))}
          </div>
        </div>
        
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b px-4 py-4">
            <div className="flex w-full items-center">
              {columns.filter(col => !isMobile || !col.hideOnMobile).map((column, index) => (
                <div 
                  key={column.key} 
                  className={cn(
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    index === columns.length - 1 ? "ml-auto" : "mr-3"
                  )}
                  style={{ width: column.width || "auto" }}
                >
                  <Skeleton className={cn(
                    "h-5 w-5/6 bg-muted/40",
                    index === 0 && "w-3/4 h-6"
                  )} />
                  {index === 0 && (
                    <Skeleton className="h-4 w-2/3 bg-muted/30 mt-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show empty state if no data
  if (displayData.length === 0) {
    return (
      <TableEmptyState
        message={emptyStateMessage}
        actionLabel={emptyStateActionLabel}
        onAction={onEmptyStateAction}
        filterActive={isFilterActive}
      />
    );
  }

  // Responsive behavior for mobile
  if (isMobile) {
    return (
      <div className="space-y-4 animate-fade-in">
        {displayData.map((item, index) => (
          <div key={index} className="border rounded-md p-4 bg-white hover:bg-accent/10 transition-colors">
            {renderRow(item, index)}
          </div>
        ))}
        {pagination && (
          <AdminTablePagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="border rounded-md shadow-sm overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                width={column.width}
                className={cn(
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  sortable && column.sortable && "cursor-pointer hover:bg-muted/60 transition-colors select-none",
                )}
                onClick={() => column.sortable && handleSort(column.key)}
                aria-sort={
                  sortConfig?.key === column.key
                    ? sortConfig.direction === "asc" 
                      ? "ascending" 
                      : "descending"
                    : undefined
                }
              >
                <div className={cn(
                  "flex items-center",
                  column.align === "center" && "justify-center",
                  column.align === "right" && "justify-end",
                )}>
                  {column.header}
                  {sortable && column.sortable && (
                    <span className="inline-flex ml-2">
                      {sortConfig?.key === column.key ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp className="h-4 w-4 text-primary" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-primary" />
                        )
                      ) : (
                        <div className="h-4 w-4 text-muted-foreground/30 flex flex-col">
                          <ArrowUp className="h-2 w-2" />
                          <ArrowDown className="h-2 w-2" />
                        </div>
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((item, index) => renderRow(item, index))}
        </TableBody>
      </Table>
      
      {pagination && (
        <div className="border-t p-2">
          <AdminTablePagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}
