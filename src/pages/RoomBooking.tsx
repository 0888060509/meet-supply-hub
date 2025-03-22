
import { useState } from "react";
import { rooms, bookings, Room } from "@/lib/data";
import RoomCard from "@/components/RoomCard";
import BookingCalendar from "@/components/BookingCalendar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Search, X } from "lucide-react";

const RoomBooking = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  
  // Get unique equipment options for filter
  const equipmentOptions = Array.from(
    new Set(rooms.flatMap(room => room.equipment))
  );
  
  const handleBookNow = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setSelectedRoom(room);
      setBookingOpen(true);
    }
  };
  
  const handleBookingComplete = () => {
    setBookingOpen(false);
  };
  
  // Filter rooms based on search and filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCapacity = capacityFilter 
      ? room.capacity >= parseInt(capacityFilter) 
      : true;
    
    const matchesEquipment = equipmentFilter
      ? room.equipment.includes(equipmentFilter)
      : true;
    
    return matchesSearch && matchesCapacity && matchesEquipment;
  });
  
  // Mock user bookings for the My Bookings tab
  const userBookings = bookings.filter(booking => booking.userId === "user1");

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Booking</h1>
          <p className="text-muted-foreground mt-1">
            Find and book the perfect space for your meetings
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-accent/50 gap-1 px-3 py-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Today's Bookings: {bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length}</span>
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="all-rooms" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all-rooms">All Rooms</TabsTrigger>
          <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-rooms" className="space-y-6">
          {/* Filters */}
          <div className="bg-accent/30 rounded-lg p-4 flex flex-col sm:flex-row gap-4 border border-accent">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms by name or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            
            <Select value={capacityFilter} onValueChange={setCapacityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any capacity</SelectItem>
                <SelectItem value="2">2+ people</SelectItem>
                <SelectItem value="4">4+ people</SelectItem>
                <SelectItem value="8">8+ people</SelectItem>
                <SelectItem value="12">12+ people</SelectItem>
                <SelectItem value="16">16+ people</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any equipment</SelectItem>
                {equipmentOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Room Grid */}
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No rooms match your criteria</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setCapacityFilter("");
                  setEquipmentFilter("");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onBookNow={handleBookNow}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-bookings">
          {userBookings.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">No upcoming bookings</h3>
              <p className="text-muted-foreground mt-1 mb-4">You don't have any room bookings yet</p>
              <Button onClick={() => document.querySelector('button[value="all-rooms"]')?.click()}>
                Book a Room
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userBookings.map((booking) => {
                    const room = rooms.find(r => r.id === booking.roomId);
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            {room?.name}
                            <span className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {room?.location}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{`${booking.startTime} - ${booking.endTime}`}</TableCell>
                        <TableCell>{booking.title}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Cancel</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book {selectedRoom?.name}</DialogTitle>
            <DialogDescription className="flex items-center text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1 inline" />
              {selectedRoom?.location}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoom && (
            <BookingCalendar
              room={selectedRoom}
              existingBookings={bookings.filter(b => b.roomId === selectedRoom.id)}
              onBookingComplete={handleBookingComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomBooking;
