
import { useState } from "react";
import { rooms, bookings, Room, Booking } from "@/lib/data";
import RoomCard from "@/components/RoomCard";
import BookingCalendar, { BookingFormData } from "@/components/BookingCalendar";
import BookingConfirmation from "@/components/BookingConfirmation";
import TimelineView from "@/components/TimelineView";
import RoomBookingSidebar from "@/components/RoomBookingSidebar";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Search, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
} from "@/components/ui/sidebar";

const RoomBooking = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<BookingFormData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [activeView, setActiveView] = useState<"grid" | "timeline">("timeline");
  
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
    // Here you would typically delete the booking from your backend
    toast.success("Booking cancelled successfully");
    
    // In a real app, you would remove the booking from your bookings state
    // and refresh the relevant views
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

  return (
    <SidebarProvider>
      <div className="flex h-[calc(100vh-4rem)] w-full bg-background">
        {/* Sidebar */}
        <Sidebar variant="inset" collapsible="icon" className="border-r">
          <SidebarContent>
            <RoomBookingSidebar 
              rooms={rooms}
              userBookings={userBookings}
              onBookNow={handleBookNow}
              onCancelBooking={handleCancelBooking}
            />
          </SidebarContent>
        </Sidebar>
        
        {/* Main Content */}
        <SidebarInset>
          <div className="container py-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Room Booking</h1>
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
            
            {/* Search Bar */}
            <div className="bg-accent/30 rounded-lg p-4 flex flex-col sm:flex-row gap-4 border border-accent mb-6">
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
            </div>
            
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
            
            {/* Main Content View */}
            {activeView === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onBookNow={handleBookNow}
                  />
                ))}
              </div>
            ) : (
              <TimelineView
                rooms={filteredRooms}
                bookings={bookings}
                onSelectTimeSlot={handleTimeSlotSelect}
              />
            )}
          </div>
        </SidebarInset>
      </div>
      
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
    </SidebarProvider>
  );
};

export default RoomBooking;
