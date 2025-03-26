import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { rooms as initialRooms, Room } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import SettingsSidebar from "@/components/SettingsSidebar";
const AdminRoomManagement = () => {
  const {
    isAdmin
  } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
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
  const handleBack = () => {
    navigate(-1);
  };

  // Redirect to dashboard if not an admin
  if (!isAdmin) {
    return <div className="container py-8">
        <h1 className="text-2xl font-bold">Unauthorized Access</h1>
        <p className="text-muted-foreground mt-2">
          You do not have permission to access this page.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>;
  }
  return <div className="flex min-h-[calc(100vh-64px)]">
      <SettingsSidebar />
      <div className="flex-1 p-6 md:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Meeting Room Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage your organization's meeting rooms
              </p>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <Button asChild>
              <Link to="/admin/rooms/new" className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add New Room
              </Link>
            </Button>
          </div>

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
                {rooms.length === 0 ? <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No rooms found. Add your first meeting room to get started.
                    </TableCell>
                  </TableRow> : rooms.map(room => <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.capacity} people</TableCell>
                      <TableCell>{room.location}</TableCell>
                      <TableCell>
                        {room.equipment.map((item, i) => <span key={i} className="inline-block bg-accent/50 text-xs rounded px-2 py-1 mr-1 mb-1">
                            {item}
                          </span>)}
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
                    </TableRow>)}
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
    </div>;
};
export default AdminRoomManagement;