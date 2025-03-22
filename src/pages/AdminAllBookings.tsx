
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { bookings, rooms, Booking } from "@/lib/data";
import { Search, Calendar, Filter } from "lucide-react";

const AdminAllBookings = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Filter bookings based on search term and date filter
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rooms.find((r) => r.id === booking.roomId)?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter ? booking.date === dateFilter : true;

    return matchesSearch && matchesDate;
  });

  // Get room name by roomId
  const getRoomName = (roomId: string) => {
    return rooms.find((room) => room.id === roomId)?.name || "Unknown Room";
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
    <div className="container py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">All Bookings</h1>
        <p className="text-muted-foreground mt-1">
          Manage and view all meeting room bookings across the organization
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or room name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-72">
          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            className="pl-8"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={() => {
            setSearchTerm("");
            setDateFilter("");
          }}
        >
          <Filter className="h-4 w-4 mr-2" /> Clear Filters
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Meeting Title</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Booked By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No bookings found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.title}</TableCell>
                  <TableCell>{getRoomName(booking.roomId)}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>
                    {booking.startTime} - {booking.endTime}
                  </TableCell>
                  <TableCell>
                    {booking.userId === "1" ? "Employee User" : 
                     booking.userId === "2" ? "Admin User" : "User " + booking.userId}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default AdminAllBookings;
