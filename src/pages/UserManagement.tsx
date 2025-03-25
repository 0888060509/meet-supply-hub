<<<<<<< HEAD

import React, { useState } from "react";
import { Users, UserPlus } from "lucide-react";
=======
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Trash2 } from "lucide-react";
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

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  roles: string[];
  status: 'active' | 'inactive';
  created_at?: string;
  last_login?: string;
  login_count?: number;
}

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiClient.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const checkDuplicateFields = async () => {
    try {
      const response = await apiClient.checkDuplicateFields({
        username: newUser.username,
        email: newUser.email
      });
      
      const newErrors: Record<string, string> = {};
      
      if (response.duplicateUsername) {
        newErrors.username = 'Tên đăng nhập đã tồn tại';
      }
      if (response.duplicateEmail) {
        newErrors.email = 'Email đã tồn tại';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
      
    } catch (error) {
      console.error('Error checking duplicate fields:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể kiểm tra thông tin trùng lặp',
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
    const isValid = await checkDuplicateFields();
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

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await apiClient.updateUser(selectedUser.id, {
        name: selectedUser.name,
        email: selectedUser.email,
        roles: selectedUser.roles
      });
      toast({
        title: 'Success',
        description: 'User updated successfully'
      });
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive'
      });
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

  const removeAccents = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const getStatusText = (status: 'active' | 'inactive') => {
    return status;
  };

  const getStatusConfirmMessage = (status: 'active' | 'inactive') => {
    if (status === 'active') {
      return 'Bạn có chắc chắn muốn thay đổi trạng thái tài khoản này thành inactive không? Người dùng sẽ không thể đăng nhập sau khi bị thay đổi.';
    }
    return 'Bạn có chắc chắn muốn thay đổi trạng thái tài khoản này thành active không? Người dùng sẽ có thể đăng nhập sau khi được thay đổi.';
  };

  const filteredUsers = users.filter(user => {
    const searchTermLower = removeAccents(searchTerm.toLowerCase());
    const usernameLower = removeAccents((user.username || '').toLowerCase());
    const nameLower = removeAccents((user.name || '').toLowerCase());
    const emailLower = removeAccents((user.email || '').toLowerCase());
    
    const matchesSearch = usernameLower.includes(searchTermLower) ||
                         nameLower.includes(searchTermLower) ||
                         emailLower.includes(searchTermLower);
    
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'employee':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatLastLogin = (lastLogin?: string, loginCount?: number) => {
    if (!lastLogin) return 'Chưa đăng nhập lần nào';
    
    const distance = formatDistanceToNow(new Date(lastLogin), { 
      addSuffix: true,
      locale: vi 
    });
    
    return `${distance}`;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username, name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">active</SelectItem>
            <SelectItem value="inactive">inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                Không tìm thấy người dùng nào phù hợp với điều kiện tìm kiếm
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles.map(role => (
                    <Badge key={role} variant={getRoleBadgeVariant(role)} className="mr-1">
                      {role}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>{getStatusText(user.status)}</span>
                  </div>
                </TableCell>
                <TableCell>{user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
                <TableCell>{formatLastLogin(user.last_login, user.login_count)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={user.status === 'active' ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => {
                        setUserToToggle(user);
                        setShowStatusDialog(true);
                      }}
                    >
                      {user.status === 'active' ? 'Set inactive' : 'Set active'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setUserToDelete(user);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => {
        setIsAddModalOpen(open);
        if (!open) {
          setErrors({});
          setNewUser({
            username: '',
            password: '',
            name: '',
            email: '',
            roles: [],
            status: 'active'
          });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Tên đăng nhập"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Mật khẩu"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <Input
                placeholder="Tên"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Select
                value={newUser.roles[0]}
                onValueChange={(value) => setNewUser({ ...newUser, roles: [value] })}
              >
                <SelectTrigger className={errors.roles ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
              {errors.roles && <p className="text-sm text-red-500 mt-1">{errors.roles}</p>}
            </div>

            <Button onClick={handleAddUser} className="w-full">Thêm người dùng</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={selectedUser?.name || ''}
              onChange={(e) => setSelectedUser(prev => prev ? { ...prev, name: e.target.value } : null)}
            />
            <Input
              type="email"
              placeholder="Email"
              value={selectedUser?.email || ''}
              onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
            />
            <Select
              value={selectedUser?.roles[0]}
              onValueChange={(value) => setSelectedUser(prev => prev ? { ...prev, roles: [value] } : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleUpdateUser}>Update User</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToToggle?.status === 'active' ? 'Thay đổi trạng thái thành inactive' : 'Thay đổi trạng thái thành active'}
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
              Hủy
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
>>>>>>> 50d34be (Add user management)
    </div>
  );
};

export default UserManagement;
