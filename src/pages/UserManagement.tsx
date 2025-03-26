<<<<<<< HEAD

import React, { useState } from "react";
import { Users, UserPlus } from "lucide-react";
=======
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
>>>>>>> 50d34be (Add user management)
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import SettingsSidebar from "@/components/SettingsSidebar";
import ManagementHeader from "@/components/ManagementHeader";
import ManagementToolbar from "@/components/ManagementToolbar";
import TableEmptyState from "@/components/TableEmptyState";
import { AddUserModal } from "@/components/AddUserModal";
import { EditUserModal } from "@/components/EditUserModal";
import { UserProfileModal } from "@/components/UserProfileModal";
<<<<<<< HEAD

const initialUsers = [{
  id: "1",
  username: "admin",
  email: "admin@example.com",
  role: "admin",
  status: "active"
}, {
  id: "2",
  username: "johndoe",
  email: "john@example.com",
  role: "user",
  status: "active"
}, {
  id: "3",
  username: "janedoe",
  email: "jane@example.com",
  role: "user",
  status: "inactive"
}, {
  id: "4",
  username: "sarahsmith",
  email: "sarah@example.com",
  role: "admin",
  status: "active"
}, {
  id: "5",
  username: "mikebrown",
  email: "mike@example.com",
  role: "user",
  status: "active"
}];

const UserManagement = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<null | typeof initialUsers[0]>(null);
  const usersPerPage = 10;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === userId ? {
      ...user,
      status: user.status === "active" ? "inactive" : "active"
    } : user));
    toast.success(`User ${users.find(u => u.id === userId)?.status === "active" ? "deactivated" : "activated"} successfully`);
  };

  const handleViewUserDetails = (user: typeof initialUsers[0]) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleEditUser = (user: typeof initialUsers[0]) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <SettingsSidebar />
      <div className="flex-1 p-6 md:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <ManagementHeader
            title="User Management"
            description="Manage user accounts and permissions"
            icon={Users}
          />

          <ManagementToolbar
            searchPlaceholder="Search by username or email..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            addButtonText="Add User"
            onAddClick={() => setIsAddUserModalOpen(true)}
          >
            {/* Filters placed here below search and add button */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </ManagementToolbar>

          {filteredUsers.length > 0 ? (
            <>
              <div className="border rounded-md shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.map(user => (
                      <TableRow 
                        key={user.id} 
                        className={`hover:bg-accent/30 transition-colors ${user.status === "inactive" ? "opacity-60" : ""}`}
                      >
                        <TableCell 
                          className="font-medium cursor-pointer hover:underline" 
                          onClick={() => handleViewUserDetails(user)}
                        >
                          {user.username}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${user.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="capitalize">{user.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                              Edit
                            </Button>
                            <Button 
                              variant={user.status === "active" ? "destructive" : "outline"} 
                              size="sm" 
                              onClick={() => handleToggleUserStatus(user.id)}
                            >
                              {user.status === "active" ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === totalPages} 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <TableEmptyState
              message={
                searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "No matching users found. Try adjusting your search or filters."
                  : "No users found. Click '+ Add User' to create one."
              }
              actionLabel="Add User"
              onAction={() => setIsAddUserModalOpen(true)}
              filterActive={!!searchTerm || roleFilter !== "all" || statusFilter !== "all"}
            />
          )}

          <AddUserModal 
            isOpen={isAddUserModalOpen} 
            onClose={() => setIsAddUserModalOpen(false)} 
            onAddUser={(newUser) => {
              setUsers(prevUsers => [...prevUsers, {
                ...newUser,
                id: Date.now().toString()
              }]);
              toast.success("User created successfully");
              setIsAddUserModalOpen(false);
            }} 
            existingUsers={users} 
          />
          
          {selectedUser && (
            <>
              <EditUserModal 
                isOpen={isEditUserModalOpen} 
                onClose={() => setIsEditUserModalOpen(false)} 
                onUpdateUser={(updatedUser) => {
                  setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
                  toast.success("User updated successfully");
                  setIsEditUserModalOpen(false);
                }} 
                user={selectedUser} 
                existingUsers={users} 
              />
              
              <UserProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
                user={selectedUser} 
                onEditUser={() => {
                  setIsProfileModalOpen(false);
                  setIsEditUserModalOpen(true);
                }} 
              />
            </>
          )}
        </div>
      </div>
=======
import { toast } from "sonner";
import apiClient from "../lib/api";
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ManagementHeader } from "@/components/ManagementHeader";
import { ManagementToolbar } from "@/components/ManagementToolbar";
import { TableEmptyState } from "@/components/TableEmptyState";
import { Users } from "lucide-react";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { UserTable } from "@/components/UserTable";

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

const PAGE_SIZE_OPTIONS = [3, 5, 10, 25, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

interface SortConfig {
  field: keyof User;
  order: 'asc' | 'desc';
}

// Tách các hàm tiện ích ra khỏi component
const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'manager':
      return 'default';
    case 'user':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    default:
      return status;
  }
};

const formatLastLogin = (lastLogin: string | null, loginCount: number) => {
  if (!lastLogin) return 'Never';
  const date = new Date(lastLogin);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return format(date, 'dd/MM/yyyy HH:mm');
};

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    roles: [] as string[],
    status: 'active' as const
  });
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [total, setTotal] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'created_at', order: 'desc' });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [addUserErrors, setAddUserErrors] = useState<{
    username?: string;
    email?: string;
  }>({});
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, roleFilter, statusFilter, sortConfig]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset về trang 1 khi search
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUsers({
        page,
        pageSize: Number(pageSize),
        search: search,
        roleFilter: roleFilter === 'all' ? undefined : roleFilter,
        statusFilter: statusFilter === 'all' ? undefined : statusFilter,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order
      });
      
      if (response && response.data) {
        setUsers(response.data);
        setTotal(response.total);
      } else {
        setUsers([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotal(0);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách người dùng',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const validateNewUser = () => {
    const newErrors: Record<string, string> = {};

    if (!newUser.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    }

    if (!newUser.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (newUser.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!newUser.name.trim()) {
      newErrors.name = 'Tên không được để trống';
    }

    if (!newUser.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!newUser.roles.length) {
      newErrors.roles = 'Vui lòng chọn ít nhất một vai trò';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicateFields = async (username: string, email: string, userId?: string) => {
    try {
      const response = await apiClient.checkDuplicateFields({
        username,
        email,
        userId
      });
      
      const errors: { username?: string; email?: string } = {};
      
      if (response.duplicateUsername) {
        errors.username = 'Username already exists';
      }
      if (response.duplicateEmail) {
        errors.email = 'Email already exists';
      }
      
      setAddUserErrors(errors);
      return Object.keys(errors).length === 0;
      
    } catch (error) {
      console.error('Error checking duplicate fields:', error);
      toast({
        title: 'Error',
        description: 'Could not check for duplicate fields',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleAddUser = async () => {
    if (!validateNewUser()) {
      return;
    }

    // Kiểm tra trùng lặp trước khi gửi request tạo user
    const isValid = await checkDuplicateFields(newUser.username, newUser.email);
    if (!isValid) {
      return;
    }

    try {
      await apiClient.createUser(newUser);
      toast({
        title: 'Thành công',
        description: 'Tạo người dùng mới thành công'
      });
      setIsAddModalOpen(false);
      setNewUser({
        username: '',
        password: '',
        name: '',
        email: '',
        roles: [],
        status: 'active' as const
      });
      setErrors({});
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      // Xử lý lỗi từ server nếu vẫn có trường hợp trùng lặp
      if (error.response?.data?.message?.includes('username')) {
        setErrors(prev => ({ ...prev, username: 'Tên đăng nhập đã tồn tại' }));
      } else if (error.response?.data?.message?.includes('email')) {
        setErrors(prev => ({ ...prev, email: 'Email đã tồn tại' }));
      } else {
        toast({
          title: 'Lỗi',
          description: 'Không thể tạo người dùng mới',
          variant: 'destructive'
        });
      }
    }
  };

  const handleUpdateUser = async (values: any) => {
    if (!selectedUser) return;

    // Check for duplicates first
    const isValid = await checkDuplicateFields(values.username, values.email, selectedUser.id);
    if (!isValid) {
      return;
    }

    try {
      const response = await apiClient.updateUser(selectedUser.id, {
        username: values.username,
        name: values.name,
        email: values.email,
        roles: [values.role] // Convert single role to array for backend compatibility
      });

      toast({
        title: 'Success',
        description: 'User updated successfully'
      });

      setIsEditModalOpen(false);
      setSelectedUser(null);
      setAddUserErrors({});
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      // Handle server-side validation errors
      if (error.response?.data?.errors) {
        setAddUserErrors(error.response.data.errors);
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to update user',
          variant: 'destructive'
        });
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await apiClient.updateUserStatus(user.id, newStatus);
      toast({
        title: 'Success',
        description: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
      });
      setShowStatusDialog(false);
      setUserToToggle(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await apiClient.deleteUser(userToDelete.id);
      toast({
        title: 'Thành công',
        description: 'Đã xóa tài khoản người dùng',
      });
      setShowDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tài khoản người dùng',
        variant: 'destructive',
      });
    }
  };

  const getStatusConfirmMessage = (status: 'active' | 'inactive') => {
    if (status === 'active') {
      return 'Are you sure you want to change this account status to inactive? The user will not be able to log in after this change.';
    }
    return 'Are you sure you want to change this account status to active? The user will be able to log in after this change.';
  };

  const handleSort = (field: SortConfig['field']) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <SettingsSidebar />
      <div className="flex-1 p-6 md:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <ManagementHeader
            title="User Management"
            description="Manage user accounts and permissions"
            icon={Users}
          />
          
          <ManagementToolbar
            searchPlaceholder="Search users..."
            searchValue={search}
            onSearchChange={setSearch}
            addButtonText="Add User"
            onAddClick={() => setIsAddModalOpen(true)}
          >
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </ManagementToolbar>

<<<<<<< HEAD
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản của người dùng "{userToDelete?.name}" không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setUserToDelete(null);
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Xóa tài khoản
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
>>>>>>> 50d34be (Add user management)
=======
          {users.length > 0 ? (
            <>
              <div className="border rounded-md shadow-sm overflow-hidden">
                <UserTable 
                  users={users}
                  isLoading={isLoading}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                  onEdit={(user) => {
                    setSelectedUser(user);
                    setIsEditModalOpen(true);
                  }}
                  onToggleStatus={(user) => {
                    setUserToToggle(user);
                    setShowStatusDialog(true);
                  }}
                  onDelete={(user) => {
                    setUserToDelete(user);
                    setShowDeleteDialog(true);
                  }}
                  onViewDetails={(user) => {
                    setSelectedUser(user);
                    setIsProfileModalOpen(true);
                  }}
                  page={page}
                  pageSize={pageSize}
                  total={total}
                  totalPages={Math.ceil(total / pageSize)}
                  onPageChange={setPage}
                  onPageSizeChange={(size: PageSize) => setPageSize(size)}
                />
              </div>
            </>
          ) : (
            <TableEmptyState
              message={
                search || roleFilter !== "all" || statusFilter !== "all"
                  ? "No matching users found. Try adjusting your search or filters."
                  : "No users found. Click '+ Add User' to create one."
              }
              actionLabel="Add User"
              onAction={() => setIsAddModalOpen(true)}
              filterActive={!!search || roleFilter !== "all" || statusFilter !== "all"}
            />
          )}

          {/* Add User Modal */}
          <AddUserModal
            open={isAddModalOpen}
            onOpenChange={(open) => {
              setIsAddModalOpen(open);
              if (!open) {
                setAddUserErrors({});
              }
            }}
            serverErrors={addUserErrors}
            onSubmit={async (values) => {
              // Check for duplicates first
              const isValid = await checkDuplicateFields(values.username, values.email);
              if (!isValid) {
                return;
              }

              try {
                const response = await apiClient.createUser({
                  username: values.username,
                  password: values.password,
                  name: values.name,
                  email: values.email,
                  roles: values.roles,
                  status: 'active'
                });
                
                toast({
                  title: 'Success',
                  description: 'User created successfully',
                });
                
                setIsAddModalOpen(false);
                setAddUserErrors({});
                fetchUsers(); // Refresh user list
              } catch (error: any) {
                console.error('Error creating user:', error);
                // Handle server-side validation errors
                if (error.response?.data?.errors) {
                  setAddUserErrors(error.response.data.errors);
                } else {
                  toast({
                    title: 'Error',
                    description: error.response?.data?.message || 'Failed to create user',
                    variant: 'destructive'
                  });
                }
              }
            }}
          />

          {/* Edit User Modal */}
          {selectedUser && (
            <EditUserModal
              open={isEditModalOpen}
              onOpenChange={(open) => {
                setIsEditModalOpen(open);
                if (!open) {
                  setSelectedUser(null);
                }
              }}
              defaultValues={selectedUser}
              onSubmit={handleUpdateUser}
            />
          )}

          <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {userToToggle?.status === 'active' ? 'Change status to inactive' : 'Change status to active'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {userToToggle && getStatusConfirmMessage(userToToggle.status)}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setShowStatusDialog(false);
                  setUserToToggle(null);
                }}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  className={userToToggle?.status === 'active' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}
                  onClick={() => userToToggle && handleToggleStatus(userToToggle)}
                >
                  {userToToggle?.status === 'active' ? 'Set inactive' : 'Set active'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa tài khoản của người dùng "{userToDelete?.name}" không?
                  Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setShowDeleteDialog(false);
                  setUserToDelete(null);
                }}>
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteUser}>
                  Xóa tài khoản
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {selectedUser && (
            <UserProfileModal
              open={isProfileModalOpen}
              onOpenChange={(open) => {
                setIsProfileModalOpen(open);
                if (!open) {
                  setSelectedUser(null);
                }
              }}
              user={selectedUser}
              onEdit={() => {
                setIsProfileModalOpen(false);
                setIsEditModalOpen(true);
              }}
            />
          )}
        </div>
      </div>
>>>>>>> 388d334 (- CRUD for User maangement)
    </div>
  );
};

export default UserManagement;
