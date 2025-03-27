import React, { useState } from "react";
import { Boxes, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { ManagementHeader } from "@/components/ManagementHeader";
import { ManagementToolbar } from "@/components/ManagementToolbar";
import { TableEmptyState } from "@/components/TableEmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddEquipmentModal from "@/components/inventory/AddEquipmentModal";
import DeleteEquipmentModal from "@/components/inventory/DeleteEquipmentModal";
import { Badge } from "@/components/ui/badge";

// Sample data - would be replaced with actual API data in a real implementation
const rooms = [
  { id: "room1", name: "Conference Room A" },
  { id: "room2", name: "Meeting Room B" },
  { id: "room3", name: "Executive Boardroom" },
  { id: "room4", name: "Training Room" },
];

const equipmentTypes = [
  "All",
  "Projector",
  "Whiteboard",
  "Chair",
  "Table",
  "TV",
  "Microphone",
];

const statuses = ["All", "Available", "In Use", "Under Maintenance"];

// Sample inventory data
const initialInventory = [
  {
    id: "equip1",
    name: "Projector HD1080",
    type: "Projector",
    roomId: "room1",
    roomName: "Conference Room A",
    quantity: 1,
    status: "Available",
    description: "Ceiling mounted projector",
  },
  {
    id: "equip2",
    name: "Whiteboard (Large)",
    type: "Whiteboard",
    roomId: "room2",
    roomName: "Meeting Room B",
    quantity: 2,
    status: "Available",
    description: "Wall-mounted magnetic whiteboards",
  },
  {
    id: "equip3",
    name: "Executive Chairs",
    type: "Chair",
    roomId: "room3",
    roomName: "Executive Boardroom",
    quantity: 12,
    status: "In Use",
    description: "Leather ergonomic chairs",
  },
  {
    id: "equip4",
    name: "Conference Table",
    type: "Table",
    roomId: "room1",
    roomName: "Conference Room A",
    quantity: 1,
    status: "Available",
    description: "Large oval table with cable management",
  },
  {
    id: "equip5",
    name: "Smart TV",
    type: "TV",
    roomId: "room4",
    roomName: "Training Room",
    quantity: 1,
    status: "Under Maintenance",
    description: "75-inch 4K display, scheduled for repair",
  },
];

const InventoryManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roomFilter, setRoomFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [inventory, setInventory] = useState(initialInventory);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const itemsPerPage = 10;

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setRoomFilter("All");
    setStatusFilter("All");
    setTypeFilter("All");
  };

  // Open add equipment modal
  const handleAddEquipment = () => {
    setCurrentEquipment(null);
    setIsAddModalOpen(true);
  };

  // Open edit equipment modal
  const handleEditEquipment = (equipment) => {
    setCurrentEquipment(equipment);
    setIsAddModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (equipment) => {
    setCurrentEquipment(equipment);
    setIsDeleteModalOpen(true);
  };

  // Delete equipment
  const handleDeleteEquipment = () => {
    if (currentEquipment) {
      // Remove equipment from inventory
      setInventory(inventory.filter(item => item.id !== currentEquipment.id));
      
      // Close modal and show success toast
      setIsDeleteModalOpen(false);
      setCurrentEquipment(null);
      
      toast({
        title: "Equipment deleted",
        description: "The equipment has been removed successfully.",
      });
    }
  };

  // Save equipment (add or update)
  const handleSaveEquipment = (equipmentData) => {
    // If editing an existing equipment
    if (currentEquipment) {
      setInventory(inventory.map(item => 
        item.id === currentEquipment.id 
          ? { ...equipmentData, id: currentEquipment.id } 
          : item
      ));
      
      toast({
        title: "Equipment updated",
        description: "The equipment has been updated successfully.",
      });
    } 
    // If adding a new equipment
    else {
      const newEquipment = {
        ...equipmentData,
        id: `equip${Date.now()}`,
      };
      
      setInventory([...inventory, newEquipment]);
      
      toast({
        title: "Equipment added",
        description: "New equipment has been added successfully.",
      });
    }
    
    setIsAddModalOpen(false);
    setCurrentEquipment(null);
  };

  // Filter and search inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRoom = roomFilter === "All" || 
      item.roomName === roomFilter;
    
    const matchesStatus = statusFilter === "All" || 
      item.status === statusFilter;
    
    const matchesType = typeFilter === "All" || 
      item.type === typeFilter;
    
    return matchesSearch && matchesRoom && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-500 hover:bg-green-600";
      case "In Use":
        return "bg-amber-500 hover:bg-amber-600";
      case "Under Maintenance":
        return "bg-destructive hover:bg-destructive/90";
      default:
        return "bg-secondary hover:bg-secondary/80";
    }
  };

  // Simulate loading for demo purposes
  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <SettingsSidebar />
      <div className="flex-1 p-6 md:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <ManagementHeader
            title="Inventory Management"
            description="Manage room equipment for your workspace"
            icon={Boxes}
          />

          <ManagementToolbar
            searchPlaceholder="Search by equipment name, room, or status..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            addButtonText="Add Equipment"
            onAddClick={handleAddEquipment}
          >
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Rooms</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.name}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Equipment type" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchTerm || roomFilter !== "All" || statusFilter !== "All" || typeFilter !== "All") && (
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="ml-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </ManagementToolbar>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredInventory.length === 0 ? (
            <TableEmptyState
              message="No equipment found. Add new equipment to get started."
              actionLabel="Add Equipment"
              onAction={handleAddEquipment}
            />
          ) : (
            <div className="rounded-md border mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment Name</TableHead>
                    <TableHead>Room Assigned</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.roomName}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditEquipment(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="py-4 border-t">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Equipment Modal */}
      <AddEquipmentModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSave={handleSaveEquipment}
        equipment={currentEquipment}
        rooms={rooms}
        equipmentTypes={equipmentTypes.filter(type => type !== "All")}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteEquipmentModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onDelete={handleDeleteEquipment}
        equipment={currentEquipment}
      />
    </div>
  );
};

export default InventoryManagement;
