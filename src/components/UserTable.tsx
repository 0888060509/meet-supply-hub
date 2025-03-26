import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Edit, Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  roles: ('admin' | 'employee')[];
  status: 'active' | 'inactive';
  created_at?: string;
  last_login?: string;
  login_count?: number;
}

interface SortConfig {
  field: keyof User;
  order: 'asc' | 'desc';
}

interface UserTableProps {
  users: User[];
  isLoading?: boolean;
  onSort?: (field: keyof User) => void;
  sortConfig?: SortConfig;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
  onViewDetails: (user: User) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [3, 5, 10, 25, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

interface PageSizeSelectProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  onPageChange: (page: number) => void;
}

const PageSizeSelect = ({ pageSize, onPageSizeChange, onPageChange }: PageSizeSelectProps) => {
  return (
    <Select
      value={pageSize.toString()}
      onValueChange={(value) => {
        onPageSizeChange(Number(value));
        onPageChange(1);
      }}
    >
      <SelectTrigger className="w-[80px] h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PAGE_SIZE_OPTIONS.map((size) => (
          <SelectItem key={size} value={size.toString()}>
            {size}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const UserTable = ({
  users,
  isLoading,
  onSort,
  sortConfig,
  onEdit,
  onToggleStatus,
  onDelete,
  onViewDetails,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange
}: UserTableProps) => {
  const SortIcon = ({ field }: { field: keyof User }) => {
    if (!sortConfig || sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortConfig.order === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="w-full min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead 
                  className="font-medium text-gray-600" 
                  onClick={() => onSort?.('username')}
                >
                  <div className="flex items-center cursor-pointer">
                    Username
                    <SortIcon field="username" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-medium text-gray-600"
                  onClick={() => onSort?.('name')}
                >
                  <div className="flex items-center cursor-pointer">
                    Name
                    <SortIcon field="name" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-medium text-gray-600"
                  onClick={() => onSort?.('email')}
                >
                  <div className="flex items-center cursor-pointer">
                    Email
                    <SortIcon field="email" />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-gray-600">Role</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="text-right font-medium text-gray-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50 border-b">
                  <TableCell>
                    <button
                      onClick={() => onViewDetails(user)}
                      className="text-gray-900 hover:underline font-medium"
                    >
                      {user.username}
                    </button>
                  </TableCell>
                  <TableCell>
                    {user.name}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${user.email}`}
                      className="text-gray-600 hover:underline"
                    >
                      {user.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge 
                          key={role}
                          variant={role === 'admin' ? 'default' : 'secondary'}
                          className={role === 'admin' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}
                        >
                          {role === 'admin' ? 'admin' : 'user'}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-gray-700">{user.status === 'active' ? 'Active' : 'Inactive'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(user)}
                        className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                      >
                        Edit
                      </Button>
                      <Button
                        variant={user.status === 'active' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => onToggleStatus(user)}
                        className={user.status === 'active' ? 
                          'bg-red-500 hover:bg-red-600 text-white' : 
                          'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Show</span>
          <PageSizeSelect 
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            onPageChange={onPageChange}
          />
          <span>of {total} users</span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={page === 1} 
              onClick={() => onPageChange(1)}
              className="text-gray-600 hover:text-gray-900"
            >
              First
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={page === 1} 
              onClick={() => onPageChange(Math.max(page - 1, 1))}
              className="text-gray-600 hover:text-gray-900"
            >
              Previous
            </Button>

            <div className="flex items-center gap-1 px-2">
              <span className="text-sm text-gray-600">Page</span>
              <Select
                value={page.toString()}
                onValueChange={(value) => onPageChange(Number(value))}
              >
                <SelectTrigger className="w-[60px] h-8 border-0 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <SelectItem key={p} value={p.toString()}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">of {totalPages}</span>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              disabled={page === totalPages} 
              onClick={() => onPageChange(Math.min(page + 1, totalPages))}
              className="text-gray-600 hover:text-gray-900"
            >
              Next
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={page === totalPages} 
              onClick={() => onPageChange(totalPages)}
              className="text-gray-600 hover:text-gray-900"
            >
              Last
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 