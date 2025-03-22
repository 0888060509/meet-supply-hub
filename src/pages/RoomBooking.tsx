
import { useState } from "react";
import { rooms, bookings, Room, Booking } from "@/lib/data";
import RoomCard from "@/components/RoomCard";
import BookingCalendar, { BookingFormData } from "@/components/BookingCalendar";
import BookingConfirmation from "@/components/BookingConfirmation";
import TimelineView from "@/components/TimelineView";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Calendar, MapPin, Search, X, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const RoomBooking = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [pendingBooking, setPendingBooking] = useState<BookingFormData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [activeView, setActiveView] = useState<"grid" | "timeline">("grid");
  
  // Get unique equipment options for filter
  const equipmentOptions = Array.from(
    new Set(rooms.flatMap(room => room.equipment))
  );
  
  const handleBookNow = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setSelectedRoom(room);
      setBookingOpen(true);
      setConfirmationOpen(false);
    }
  };
  
  const handleBookingData = (bookingData: BookingFormData) => {
    setPendingBooking(bookingData);
    setBookingOpen(false);
    setConfirmationOpen(true);
  };
  
  const handleConfirmBooking = () => {
    if (pendingBooking) {
      // Here you would typically save the booking to your backend
      // For now we'll just show a success message
      toast.success("Room booked successfully!");
      setConfirmationOpen(false);
      setPendingBooking(null);
      
      // In a real app, you would add the new booking to your bookings state
      // and refresh the relevant views
    }
  };
  
  const handleCancelBooking = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };
  
  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      // Here you would typically delete the booking from your backend
      toast.success("Booking cancelled successfully");
      setCancelDialogOpen(false);
      setBookingToCancel(null);
      
      // In a real app, you would remove the booking from your bookings state
      // and refresh the relevant views
    }
  };
  
  const handleTimeSlotSelect = (roomId: string, date: Date, startTime: string, endTime: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setSelectedRoom(room);
      
      // Pre-populate data for the booking calendar
      const defaultTitle = `Meeting in ${room.name}`;
      const formData: BookingFormData = {
        title: defaultTitle,
        date: format(date, "yyyy-MM-dd"),
        startTime,
        endTime,
        attendees: 2, // Default value, user can change
        equipment: [],
        roomId: room.id,
        roomName: room.name
      };
      
      setPendingBooking(formData);
      setBookingOpen(true);
    }
  };
  
  // Filter rooms based on search and filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCapacity = capacityFilter && capacityFilter !== "any-capacity"
      ? room.capacity >= parseInt(capacityFilter) 
      : true;
    
    const matchesEquipment = equipmentFilter && equipmentFilter !== "any-equipment"
      ? room.equipment.includes(equipmentFilter)
      : true;
    
    return matchesSearch && matchesCapacity && matchesEquipment;
  });
  
  // Mock user bookings for the My Bookings tab
  const userBookings = bookings.filter(booking => booking.userId === "user1");

  // Fix for the document.querySelector error
  const handleSwitchToAllRooms = () => {
    const tabsTrigger = document.querySelector('button[value="all-rooms"]') as HTMLButtonElement;
    if (tabsTrigger) {
      tabsTrigger.click();
    }
  };

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
          {/* View Toggle */}
          <div className="flex justify-end mb-4">
            <div className="border rounded-lg overflow-hidden">
              <Button
                variant={activeView === "grid" ? "default" : "ghost"}
                className="rounded-none"
                onClick={() => setActiveView("grid")}
              >
                Grid View
              </Button>
              <Button
                variant={activeView === "timeline" ? "default" : "ghost"}
                className="rounded-none"
                onClick={() => setActiveView("timeline")}
              >
                Timeline View
              </Button>
            </div>
          </div>
          
          {activeView === "grid" ? (
            <>
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
                    <SelectItem value="any-capacity">Any capacity</SelectItem>
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
                    <SelectItem value="any-equipment">Any equipment</SelectItem>
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
                      setCapacityFilter("any-capacity");
                      setEquipmentFilter("any-equipment");
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
            </>
          ) : (
            /* Timeline View */
            <TimelineView
              rooms={rooms}
              bookings={bookings}
              onSelectTimeSlot={handleTimeSlotSelect}
            />
          )}
        </TabsContent>
        
        <TabsContent value="my-bookings">
          {userBookings.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">No upcoming bookings</h3>
              <p className="text-muted-foreground mt-1 mb-4">You don't have any room bookings yet</p>
              <Button onClick={handleSwitchToAllRooms}>
                Book a Room
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meeting</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userBookings.map((booking) => {
                    const room = rooms.find(r => r.id === booking.roomId);
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            {booking.date}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            {`${booking.startTime} - ${booking.endTime}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {room?.name}
                            <span className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {room?.location}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
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
              onBookingComplete={handleBookingData}
              initialData={pendingBooking}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {pendingBooking && (
            <BookingConfirmation
              bookingData={pendingBooking}
              onConfirm={handleConfirmBooking}
              onCancel={() => {
                setConfirmationOpen(false);
                setBookingOpen(true);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Cancel Booking Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep booking</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelBooking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoomBooking;
