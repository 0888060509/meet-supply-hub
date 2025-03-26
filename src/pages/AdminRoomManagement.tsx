
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { rooms as initialRooms, Room } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Layout } from "lucide-react";
import { toast } from "sonner";
import SettingsSidebar from "@/components/SettingsSidebar";
import ManagementHeader from "@/components/ManagementHeader";
import ManagementToolbar from "@/components/ManagementToolbar";
import TableEmptyState from "@/components/TableEmptyState";
import { Badge } from "@/components/ui/badge";
import DeleteRoomModal from "@/components/room/DeleteRoomModal";
import RoomFormModal from "@/components/room/RoomFormModal";

const AdminRoomManagement = () => {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filter rooms based on search term
  const filteredRooms = searchTerm 
    ? rooms.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : rooms;

  const handleAddRoom = (newRoom: Room) => {
    setRooms([...rooms, { ...newRoom, id: `room-${Date.now()}` }]);
    toast.success(`Room "${newRoom.name}" has been added`);
    setIsAddModalOpen(false);
  };

  const handleEditRoom = (updatedRoom: Room) => {
    setRooms(rooms.map(room => room.id === updatedRoom.id ? updatedRoom : room));
    toast.success(`Room "${updatedRoom.name}" has been updated`);
    setIsEditModalOpen(false);
    setRoomToEdit(null);
  };

  const handleDeleteRoom = () => {
    if (roomToDelete) {
      // Filter out the deleted room
      setRooms(rooms.filter(room => room.id !== roomToDelete.id));
      toast.success(`Room "${roomToDelete.name}" has been deleted`);
      setRoomToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const openEditModal = (room: Room) => {
    setRoomToEdit(room);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
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
            description="Manage meeting rooms for your workspace"
            icon={Layout}
          />

          <ManagementToolbar
            searchPlaceholder="Search rooms by name or location..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            addButtonText="Add Room"
            onAddClick={() => setIsAddModalOpen(true)}
          />

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <TableEmptyState
                        message={searchTerm ? "No rooms found matching your search." : "No rooms found. Add your first meeting room to get started."}
                        actionLabel="Add Room"
                        onAction={() => setIsAddModalOpen(true)}
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
                          <Badge key={i} variant="outline" className="mr-1 mb-1">
                            {item}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={room.status === "Available" ? "success" : "warning"}>
                          {room.status || "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(room)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openDeleteModal(room)}>
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

          {/* Add Room Modal */}
          <RoomFormModal 
            open={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            onSubmit={handleAddRoom}
            title="Add New Room"
          />

          {/* Edit Room Modal */}
          <RoomFormModal 
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            onSubmit={handleEditRoom}
            title="Edit Room"
            room={roomToEdit}
          />

          {/* Delete Confirmation Modal */}
          <DeleteRoomModal
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            onDelete={handleDeleteRoom}
            room={roomToDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminRoomManagement;
