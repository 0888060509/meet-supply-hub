
import React, { useState } from "react";
import { Layout, Edit, Trash2 } from "lucide-react";
import { rooms as initialRooms, Room } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import DeleteRoomModal from "@/components/room/DeleteRoomModal";
import RoomFormModal from "@/components/room/RoomFormModal";
import { 
  AdminLayout,
  AdminManagementToolbar,
  AdminTable
} from "@/components/admin";

const AdminRoomManagement = () => {
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

  // Table columns configuration
  const columns = [
    { key: "name", header: "Room Name" },
    { key: "capacity", header: "Capacity" },
    { key: "location", header: "Location" },
    { key: "equipment", header: "Equipment" },
    { key: "status", header: "Status" },
    { key: "actions", header: "Actions", width: "200px" },
  ];

  // Render a table row
  const renderRoomRow = (room: Room) => (
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
  );

  return (
    <AdminLayout
      title="Meeting Room Management"
      description="Manage meeting rooms for your workspace"
      icon={Layout}
    >
      <AdminManagementToolbar
        searchPlaceholder="Search rooms by name or location..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        addButtonText="Add Room"
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <AdminTable
        columns={columns}
        data={filteredRooms}
        renderRow={renderRoomRow}
        emptyStateMessage={
          searchTerm 
            ? "No rooms found matching your search." 
            : "No rooms found. Add your first meeting room to get started."
        }
        emptyStateActionLabel="Add Room"
        onEmptyStateAction={() => setIsAddModalOpen(true)}
        isFilterActive={!!searchTerm}
      />

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
    </AdminLayout>
  );
};

export default AdminRoomManagement;
