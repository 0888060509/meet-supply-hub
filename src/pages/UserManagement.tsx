import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddUserModal } from "@/components/AddUserModal";
import { EditUserModal } from "@/components/EditUserModal";
import { UserProfileModal } from "@/components/UserProfileModal";
import { toast } from "@/hooks/use-toast";
import SettingsSidebar from "@/components/SettingsSidebar";

// Mock user data - would be replaced with actual API calls
const initialUsers = [
  { id: "1", username: "admin", email: "admin@example.com", role: "admin", status: "active" },
  { id: "2", username: "johndoe", email: "john@example.com", role: "user", status: "active" },
  { id: "3", username: "janedoe", email: "jane@example.com", role: "user", status: "inactive" },
  { id: "4", username: "sarahsmith", email: "sarah@example.com", role: "admin", status: "active" },
  { id: "5", username: "mikebrown", email: "mike@example.com", role: "user", status: "active" },
];

const UserManagement = () => {
  const [users, setUsers] = useState(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<null | typeof initialUsers[0]>(null);
  
  const usersPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const filterUsers = () => {
    let results = [...users];
    
    if (searchTerm) {
      results = results.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== "all") {
      results = results.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter !== "all") {
      results = results.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(results);
    setCurrentPage(1);
  };

  React.useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, statusFilter, users]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleAddUser = (newUser: typeof initialUsers[0]) => {
    setUsers(prevUsers => [...prevUsers, { ...newUser, id: Date.now().toString() }]);
    toast({
      title: "Success",
      description: "User created successfully",
    });
    setIsAddUserModalOpen(false);
  };

  const handleUpdateUser = (updatedUser: typeof initialUsers[0]) => {
    setUsers(prevUsers => 
      prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
    toast({
      title: "Success",
      description: "User updated successfully",
    });
    setIsEditUserModalOpen(false);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === "active" ? "inactive" : "active" } 
          : user
      )
    );
    toast({
      title: "Success",
      description: `User ${users.find(u => u.id === userId)?.status === "active" ? "deactivated" : "activated"} successfully`,
    });
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
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack} 
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>

          <div className="flex justify-end mb-6">
            <Button onClick={() => setIsAddUserModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by username or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                    {currentUsers.map((user) => (
                      <TableRow 
                        key={user.id}
                        className={user.status === "inactive" ? "opacity-60" : ""}
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
                            <div className={`h-2 w-2 rounded-full mr-2 ${
                              user.status === "active" ? "bg-green-500" : "bg-red-500"
                            }`} />
                            <span className="capitalize">{user.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditUser(user)}
                            >
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
            <div className="border rounded-md p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "No matching users found. Try adjusting your search or filters."
                  : "No users found. Click '+ Add User' to create one."}
              </p>
              {!(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
                <Button onClick={() => setIsAddUserModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
              )}
            </div>
          )}

          <AddUserModal 
            isOpen={isAddUserModalOpen} 
            onClose={() => setIsAddUserModalOpen(false)} 
            onAddUser={handleAddUser}
            existingUsers={users}
          />
          
          {selectedUser && (
            <>
              <EditUserModal 
                isOpen={isEditUserModalOpen} 
                onClose={() => setIsEditUserModalOpen(false)} 
                onUpdateUser={handleUpdateUser}
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
