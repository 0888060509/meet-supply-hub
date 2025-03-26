
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { rooms as initialRooms, Room } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Layout } from "lucide-react";
import { toast } from "sonner";
import SettingsSidebar from "@/components/SettingsSidebar";
import ManagementHeader from "@/components/ManagementHeader";
import ManagementToolbar from "@/components/ManagementToolbar";
import TableEmptyState from "@/components/TableEmptyState";

const AdminRoomManagement = () => {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter rooms based on search term
  const filteredRooms = searchTerm 
    ? rooms.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : rooms;

  const handleDeleteRoom = () => {
    if (roomToDelete) {
      // Filter out the deleted room
      setRooms(rooms.filter(room => room.id !== roomToDelete.id));
      toast.success(`Room "${roomToDelete.name}" has been deleted`);
      setRoomToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (room: Room) => {
    setRoomToDelete(room);
    setDeleteDialogOpen(true);
  };

  // Redirect to dashboard if not an admin
  if (!isAdmin) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold">Unauthorized Access</h1>
        <p className="text-muted-foreground mt-2">
          You do not have permission to access this page.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <SettingsSidebar />
      <div className="flex-1 p-6 md:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <ManagementHeader 
            title="Meeting Room Management"
            description="Manage your organization's meeting rooms"
            icon={Layout}
          />

          <ManagementToolbar
            searchPlaceholder="Search rooms by name or location..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            addButtonText="Add New Room"
            onAddClick={() => navigate("/admin/rooms/new")}
          />

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <TableEmptyState
                        message={searchTerm ? "No rooms found matching your search." : "No rooms found. Add your first meeting room to get started."}
                        actionLabel="Add New Room"
                        onAction={() => navigate("/admin/rooms/new")}
                        filterActive={!!searchTerm}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map(room => (
                    <TableRow key={room.id} className="hover:bg-accent/30 transition-colors">
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.capacity} people</TableCell>
                      <TableCell>{room.location}</TableCell>
                      <TableCell>
                        {room.equipment.map((item, i) => (
                          <span key={i} className="inline-block bg-accent/50 text-xs rounded px-2 py-1 mr-1 mb-1">
                            {item}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/rooms/edit/${room.id}`}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openDeleteDialog(room)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the room "{roomToDelete?.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteRoom}>
                  Delete Room
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminRoomManagement;
