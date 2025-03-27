import { useState } from "react";
import { rooms, bookings, Room, Booking } from "@/lib/data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RoomCard from "@/components/RoomCard";
import BookingCalendar, { BookingFormData } from "@/components/BookingCalendar";
import BookingConfirmation from "@/components/BookingConfirmation";
import TimelineView from "@/components/TimelineView";
import RoomsDisplay from "@/components/RoomsDisplay";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Search, X, Info, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const RoomBooking = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<BookingFormData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [activeView, setActiveView] = useState<"timeline">("timeline");
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<"rooms" | "bookings">(tabParam === "bookings" ? "bookings" : "rooms");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const equipmentOptions = Array.from(new Set(rooms.flatMap(room => room.equipment)));

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
      toast.success("Room booked successfully!");
      setConfirmationOpen(false);
      setPendingBooking(null);
      setActiveTab("bookings");
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('tab', 'bookings');
      navigate(`${location.pathname}?${newSearchParams.toString()}`);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    toast.success("Booking cancelled successfully");
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      handleCancelBooking(bookingToCancel);
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleTimeSlotSelect = (roomId: string, date: Date, startTime: string, endTime: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setSelectedRoom(room);
      const defaultTitle = `Meeting in ${room.name}`;
      const formData: BookingFormData = {
        title: defaultTitle,
        date: format(date, "yyyy-MM-dd"),
        startTime,
        endTime,
        attendees: 2,
        equipment: [],
        roomId: room.id,
        roomName: room.name
      };
      setPendingBooking(formData);
      setBookingOpen(true);
    }
  };

  const handleTabChange = (value: "rooms" | "bookings") => {
    setActiveTab(value);
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('tab', value);
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || room.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = capacityFilter && capacityFilter !== "any-capacity" ? room.capacity >= parseInt(capacityFilter) : true;
    const matchesEquipment = equipmentFilter && equipmentFilter !== "any-equipment" ? room.equipment.includes(equipmentFilter) : true;
    return matchesSearch && matchesCapacity && matchesEquipment;
  });

  const userBookings = bookings.filter(booking => booking.userId === "user1");

  return <div className="h-[calc(100vh-4rem)] w-full bg-background">
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
        
        <Tabs value={activeTab} onValueChange={value => handleTabChange(value as "rooms" | "bookings")} className="mb-6">
          <TabsList className="w-full md:w-auto bg-accent/20">
            <TabsTrigger value="rooms" className="flex-1 md:flex-initial">All Rooms</TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1 md:flex-initial">My Bookings</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {activeTab === "rooms" ? <>
            <div>
              <TimelineView 
                rooms={filteredRooms} 
                bookings={bookings} 
                onSelectTimeSlot={handleTimeSlotSelect} 
              />
              
              {/* All Building Rooms Section */}
              <div className="my-10 bg-accent/5 p-6 rounded-lg border">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Building Rooms</h2>
                    <p className="text-muted-foreground">
                      Explore available spaces for different meeting scenarios
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <Badge variant="outline" className="bg-primary/10">
                      {rooms.length} Rooms Available
                    </Badge>
                  </div>
                </div>
                
                <RoomsDisplay rooms={rooms} onBookNow={handleBookNow} />
              </div>
            </div>
          </> : <div className="animate-fade-in">
            <div className="bg-white rounded-lg border shadow-sm">
              {userBookings.length === 0 ? <div className="p-8 text-center text-muted-foreground">
                  You don't have any room bookings yet.
                </div> : <div className="divide-y">
                  {userBookings.map(booking => {
              const room = rooms.find(r => r.id === booking.roomId);
              return <div key={booking.id} className="p-4 hover:bg-accent/5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{booking.title}</div>
                            <div className="text-sm mt-1 flex items-center">
                              {room?.name}
                              {room && <Link to={`/rooms/${room.id}`} className="ml-2 text-primary text-xs flex items-center hover:underline">
                                  <Info className="h-3 w-3 mr-1" />
                                  View Room
                                </Link>}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {booking.date}, {booking.startTime} - {booking.endTime}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30" onClick={() => handleCancelClick(booking.id)}>
                            Cancel
                          </Button>
                        </div>
                      </div>;
            })}
                </div>}
            </div>
          </div>}
      </div>
      
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book {selectedRoom?.name}</DialogTitle>
            <DialogDescription className="flex items-center text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1 inline" />
              {selectedRoom?.location}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoom && <BookingCalendar room={selectedRoom} existingBookings={bookings.filter(b => b.roomId === selectedRoom.id)} onBookingComplete={handleBookingData} initialData={pendingBooking} />}
        </DialogContent>
      </Dialog>
      
      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {pendingBooking && <BookingConfirmation bookingData={pendingBooking} onConfirm={handleConfirmBooking} onCancel={() => {
          setConfirmationOpen(false);
          setBookingOpen(true);
        }} />}
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction onClick={confirmCancelBooking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};

export default RoomBooking;
