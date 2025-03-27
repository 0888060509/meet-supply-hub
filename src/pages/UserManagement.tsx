import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Plus, Filter, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { ManagementHeader } from "@/components/ManagementHeader";
import { ManagementToolbar } from "@/components/ManagementToolbar";
import { TableEmptyState } from "@/components/TableEmptyState";
import { AddUserModal } from "@/components/AddUserModal";
import { EditUserModal } from "@/components/EditUserModal";
import { UserProfileModal } from "@/components/UserProfileModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Users } from "lucide-react";
import apiClient from "../lib/api";
import { useAuth } from '../contexts/AuthContext';
import { User, RoleId } from "@/lib/api";

type PageSize = 10 | 20 | 30 | 50;

interface SortConfig {
  field: 'username' | 'name' | 'email' | 'created_at' | 'last_login';
  order: 'asc' | 'desc';
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ValidationErrors {
  [key: string]: string[];
}

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
  const [addUserErrors, setAddUserErrors] = useState<ValidationErrors>({});
  const [editUserErrors, setEditUserErrors] = useState<ValidationErrors>({});
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Handle URL changes
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        setSelectedUser(user);
        // Chỉ mở ProfileModal nếu không có action=edit trên URL
        if (!searchParams.get('action')) {
          setIsProfileModalOpen(true);
        } else if (searchParams.get('action') === 'edit') {
          setIsEditModalOpen(true);
        }
      }
    }
  }, [searchParams, users]);

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
        // Lọc bỏ các user không hợp lệ
        const validUsers = response.data.filter(user => 
          user && 
          typeof user === 'object' && 
          'username' in user && 
          'name' in user && 
          'email' in user && 
          'roles' in user && 
          'status' in user
        );
        setUsers(validUsers);
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
        title: 'Error',
        description: 'Unable to load user list',
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
      newErrors.username = 'Username is required';
    }

    if (!newUser.password) {
      newErrors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!newUser.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!newUser.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!newUser.roles.length) {
      newErrors.roles = 'Please select at least one role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSort = (field: SortConfig['field']) => {
    setSortConfig(prevConfig => ({
      field,
      order: prevConfig.field === field && prevConfig.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const checkDuplicateFields = async (username: string, email: string, userId?: string) => {
    try {
      const response = await apiClient.checkDuplicateFields({
        username,
        email,
        userId
      });
      
      const errors: ValidationErrors = {};
      
      if (response.duplicateUsername || response.duplicateEmail) {
        if (response.duplicateUsername) {
          errors.username = ['This username is already taken. Please choose another one.'];
        }
        if (response.duplicateEmail) {
          errors.email = ['This email address is already registered. Please use a different email.'];
        }
        
        // Set errors to corresponding state
        if (userId) {
          setEditUserErrors(errors);
        } else {
          setAddUserErrors(errors);
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      toast({
        title: 'Error',
        description: 'Unable to check for duplicate fields',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleAddUser = async (values: any) => {
    try {
      // Check for duplicates before creating user
      const notDuplicate = await checkDuplicateFields(values.username, values.email);
      if (notDuplicate) {
        const response = (await apiClient.createUser({
          username: values.username,
          name: values.name,
          email: values.email,
          password: values.password,
          roles: [values.role],
          status: 'active',
          created_at: new Date().toISOString()
        })) as unknown as ApiResponse<User>;

        setUsers(prev => [...prev, response.data]);
        setIsAddModalOpen(false);
        toast({
          title: "Success",
          description: "New user has been created"
        });
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setAddUserErrors(error.response.data.errors);
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to create new user"
        });
      }
    }
  };

  const handleUpdateUser = async (values: any) => {
    try {
      // Check for duplicates before updating user
      const notDuplicate = await checkDuplicateFields(values.username, values.email, selectedUser?.id);
      if (notDuplicate) {
        const response = (await apiClient.updateUser(selectedUser!.id, {
          username: values.username,
          name: values.name,
          email: values.email,
          roles: [values.role],
          status: values.status,
          ...(values.changePassword && { password: values.password })
        })) as unknown as ApiResponse<User>;

        setIsEditModalOpen(false);
        await fetchUsers();
        
        toast({
          title: "Success",
          description: "User information has been updated"
        });
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setEditUserErrors(error.response.data.errors);
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to update user information"
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

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiClient.deleteUser(userId);
      toast({
        title: 'Success',
        description: 'User deleted successfully'
      });
      setShowDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  const getStatusConfirmMessage = (status: string) => {
    if (status === 'active') {
      return 'Are you sure you want to deactivate this user? They will not be able to access the system until reactivated.';
    }
    return 'Are you sure you want to activate this user? They will be able to access the system after activation.';
  };

  const getRoleName = (roleId: RoleId): string => {
    console.log('Role ID:', roleId);
    switch (roleId) {
      case RoleId.Admin:
        return 'Administrator';
      case RoleId.Employee:
        return 'Employee';
      default:
        return roleId; // Fallback to show the raw role value
    }
  };

  const filteredUsers = users.filter(user => {
    // Kiểm tra user có tồn tại và có đầy đủ thuộc tính
    if (!user || !user.username || !user.name || !user.email || !user.roles || !user.status) {
      return false;
    }

    const matchesSearch = search.toLowerCase() === '' || 
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter as RoleId);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Update handlers to modify URL
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
    // Add userId và action=edit vào URL
    setSearchParams({ userId: user.id, action: 'edit' });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    // Remove cả userId và action khỏi URL
    setSearchParams({});
  };

  // Handle opening profile modal
  const handleOpenProfile = (user: User) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
    // Chỉ thêm userId vào URL, không có action
    setSearchParams({ userId: user.id });
  };

  // Handle closing profile modal
  const handleCloseProfile = () => {
    setIsProfileModalOpen(false);
    setSelectedUser(null);
    // Xóa query params khỏi URL
    setSearchParams({});
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
            description="Add, edit, and manage user accounts"
            icon={Users}
          />
          
          <ManagementToolbar
            searchPlaceholder="Search by username, name, or email..."
            searchValue={search}
            onSearchChange={setSearch}
            addButtonText="Add User"
            onAddClick={() => setIsAddModalOpen(true)}
          >
            <div className="flex items-center gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={RoleId.Admin}>{getRoleName(RoleId.Admin)}</SelectItem>
                  <SelectItem value={RoleId.Employee}>{getRoleName(RoleId.Employee)}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ManagementToolbar>

          {users.length > 0 ? (
            <>
              <div className="border rounded-md shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="font-medium text-gray-600" 
                        onClick={() => handleSort('username')}
                      >
                        <div className="flex items-center cursor-pointer">
                          Username
                          {sortConfig.field === 'username' && (
                            sortConfig.order === 'asc' ? '↑' : '↓'
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-medium text-gray-600"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center cursor-pointer">
                          Name
                          {sortConfig.field === 'name' && (
                            sortConfig.order === 'asc' ? '↑' : '↓'
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-medium text-gray-600"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center cursor-pointer">
                          Email
                          {sortConfig.field === 'email' && (
                            sortConfig.order === 'asc' ? '↑' : '↓'
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="font-medium text-gray-600">Role</TableHead>
                      <TableHead className="font-medium text-gray-600">Status</TableHead>
                      <TableHead className="text-right font-medium text-gray-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      user && (
                        <TableRow key={user.id} className="hover:bg-gray-50 border-b">
                          <TableCell>
                            <button
                              onClick={() => handleOpenProfile(user)}
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
                              {user.roles.map((roleId) => (
                                <Badge 
                                  key={roleId}
                                  variant={roleId === RoleId.Admin ? 'default' : 'secondary'}
                                  className={roleId === RoleId.Admin ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}
                                >
                                  {getRoleName(roleId)}
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
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  handleEditUser(user);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant={user.status === 'active' ? 'destructive' : 'outline'}
                                size="sm"
                                onClick={() => {
                                  setUserToToggle(user);
                                  setShowStatusDialog(true);
                                }}
                              >
                                {user.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    ))}
                  </TableBody>
                </Table>
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
            onOpenChange={setIsAddModalOpen}
            onSubmit={handleAddUser}
            errors={addUserErrors}
          />

          {/* Edit User Modal */}
          {selectedUser && (
            <EditUserModal
              open={isEditModalOpen}
              onOpenChange={(open) => {
                if (!open) {
                  handleCloseEditModal();
                }
              }}
              defaultValues={selectedUser}
              onSubmit={handleUpdateUser}
              errors={editUserErrors}
            />
          )}

          {/* User Profile Modal */}
          {selectedUser && (
            <UserProfileModal
              open={isProfileModalOpen}
              onOpenChange={(open) => {
                if (!open) {
                  handleCloseProfile();
                }
              }}
              user={selectedUser}
              onEdit={() => {
                setIsProfileModalOpen(false);
                handleEditUser(selectedUser);
              }}
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

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this user? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setShowDeleteDialog(false);
                  setUserToDelete(null);
                }}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
