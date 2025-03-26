
import React, { useState } from "react";
import { Users, UserPlus } from "lucide-react";
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
    </div>
  );
};

export default UserManagement;
