import React, { useState } from "react";
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { ManagementHeader } from "@/components/ManagementHeader";
import { ManagementToolbar } from "@/components/ManagementToolbar";
import { TableEmptyState } from "@/components/TableEmptyState";
import { bookings, rooms } from "@/lib/data";

const AdminAllBookings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Filter bookings based on search and room selection
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoom = roomFilter === "all" || booking.roomId === roomFilter;
    return matchesSearch && matchesRoom;
  });

  // Get room name by ID
  const getRoomName = (roomId: string) => {
    return rooms.find(room => room.id === roomId)?.name || "Unknown Room";
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <SettingsSidebar />
      <div className="flex-1 p-6 md:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <ManagementHeader
            title="All Bookings"
            description="View and manage all room bookings across the organization."
            icon={Calendar}
          />

          <ManagementToolbar
            searchPlaceholder="Search bookings..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            addButtonText="Add Booking"
            onAddClick={() => setIsAddModalOpen(true)}
          >
            <div className="flex items-center gap-2">
              <Select
                value={roomFilter}
                onValueChange={setRoomFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ManagementToolbar>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <TableEmptyState
                        message={
                          searchTerm || roomFilter !== "all"
                            ? "No bookings found matching your search criteria."
                            : "No bookings have been made yet."
                        }
                        actionLabel="Add Booking"
                        onAction={() => setIsAddModalOpen(true)}
                        filterActive={!!searchTerm || roomFilter !== "all"}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-accent/30 transition-colors">
                      <TableCell className="font-medium">{booking.title}</TableCell>
                      <TableCell>{getRoomName(booking.roomId)}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{`${booking.startTime} - ${booking.endTime}`}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAllBookings;
