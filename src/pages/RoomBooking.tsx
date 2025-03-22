import { useState } from "react";
import { rooms, bookings, Room, Booking } from "@/lib/data";
import RoomCard from "@/components/RoomCard";
import BookingCalendar from "@/components/BookingCalendar";
import RoomBookingForm from "@/components/RoomBookingForm";
import BookingConfirmation from "@/components/BookingConfirmation";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogTrigger 
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
import { Calendar, MapPin, Search, X, Clock, AlertCircle, Users, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Get unique equipment options from all rooms
const allEquipment = Array.from(new Set(rooms.flatMap(room => room.equipment)));

const RoomBooking = () => {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  
  // New state for the booking flow
  const [bookingStep, setBookingStep] = useState<'form' | 'rooms' | 'time' | 'confirmation'>('form');
  const [bookingFormData, setBookingFormData] = useState<{
    title: string;
    date: Date;
    attendees: number;
    equipment: string[];
    startTime?: string;
    endTime?: string;
  } | null>(null);
  
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
    
    // If we're in the room selection step after form submission, apply form filters
    const matchesFormCriteria = bookingFormData && bookingStep === 'rooms'
      ? room.capacity >= bookingFormData.attendees && 
        (bookingFormData.equipment.length === 0 || 
          bookingFormData.equipment.every(item => room.equipment.includes(item)))
      : true;
    
    return matchesSearch && matchesCapacity && matchesEquipment && matchesFormCriteria;
  });
  
  // Mock user bookings for the My Bookings tab
  const userBookings = bookings.filter(booking => booking.userId === "user1");

  // Handle form submission
  const handleRoomFormSubmit = (data: any) => {
    setBookingFormData(data);
    setBookingStep('rooms');
  };
  
  // Handle selecting a room
  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setBookingStep('time');
    setBookingOpen(true);
  };
  
  // Handle time selection
  const handleTimeSelection = (startTime: string, endTime: string) => {
    if (bookingFormData) {
      setBookingFormData({
        ...bookingFormData,
        startTime,
        endTime
      });
      setBookingStep('confirmation');
    }
  };
  
  // Handle booking confirmation
  const handleConfirmBooking = () => {
    // Here you would save the booking to your backend
    if (bookingFormData && selectedRoom && bookingFormData.startTime && bookingFormData.endTime) {
      toast.success("Room booked successfully!");
      
      // Close dialog and reset state
      setBookingOpen(false);
      setBookingStep('form');
      setBookingFormData(null);
      setSelectedRoom(null);
      
      // Switch to My Bookings tab
      const tabsTrigger = document.querySelector('button[value="my-bookings"]') as HTMLButtonElement;
      if (tabsTrigger) {
        tabsTrigger.click();
      }
    }
  };
  
  // Handle cancel booking
  const handleCancelBooking = () => {
    if (bookingStep === 'confirmation') {
      setBookingStep('time');
    } else if (bookingStep === 'time') {
      setBookingOpen(false);
      setBookingStep('rooms');
    } else if (bookingStep === 'rooms') {
      setBookingStep('form');
      setBookingFormData(null);
    }
  };

  const handleBookNow = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      handleSelectRoom(room);
    }
  };
  
  const handleTimeBookingComplete = (startTime: string, endTime: string) => {
    handleTimeSelection(startTime, endTime);
  };
  
  // Fix for the document.querySelector error
  const handleSwitchToAllRooms = () => {
    const tabsTrigger = document.querySelector('button[value="all-rooms"]') as HTMLButtonElement;
    if (tabsTrigger) {
      tabsTrigger.click();
    }
  };

  const handleCancelUserBooking = (bookingId: string) => {
    // Here you would delete the booking from your backend
    toast.success("Booking cancelled successfully!");
    
    // For demo purposes, force a re-render
    // In a real app, you'd update the state with the new bookings list
    setTimeout(() => {
      handleSwitchToAllRooms();
      setTimeout(() => {
        const tabsTrigger = document.querySelector('button[value="my-bookings"]') as HTMLButtonElement;
        if (tabsTrigger) {
          tabsTrigger.click();
        }
      }, 100);
    }, 100);
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
          {bookingStep === 'form' ? (
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-2xl font-semibold mb-6">Book a Meeting Room</h2>
              <RoomBookingForm 
                onSubmit={handleRoomFormSubmit}
                allEquipment={allEquipment}
              />
            </div>
          ) : bookingStep === 'rooms' ? (
            <>
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
                    {allEquipment.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Meeting criteria summary */}
              {bookingFormData && (
                <div className="rounded-lg border p-4 bg-card flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{bookingFormData.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{bookingFormData.attendees} attendees</span>
                    </div>
                    {bookingFormData.equipment && bookingFormData.equipment.length > 0 && (
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {bookingFormData.equipment.map((item) => (
                            <Badge key={item} variant="outline" className="text-xs bg-accent/30">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="self-end sm:self-auto"
                    onClick={handleCancelBooking}
                  >
                    Change Criteria
                  </Button>
                </div>
              )}
              
              {/* Room Grid */}
              {filteredRooms.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No rooms match your criteria</h3>
                  <p className="text-muted-foreground mt-1 mb-4">Try adjusting your filters or meeting requirements</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
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
          ) : null}
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                                <span className="sr-only">Cancel</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cancel Booking</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to cancel this booking? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-3 mt-4">
                                <Button variant="outline" onClick={() => {}}>
                                  Keep Booking
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleCancelUserBooking(booking.id)}
                                >
                                  Cancel Booking
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
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
      <Dialog open={bookingOpen} onOpenChange={(open) => {
        if (!open) {
          setBookingStep('rooms');
        }
        setBookingOpen(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {bookingStep === 'time' ? `Book ${selectedRoom?.name}` : 'Confirm Booking'}
            </DialogTitle>
            {bookingStep === 'time' && selectedRoom && (
              <DialogDescription className="flex items-center text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1 inline" />
                {selectedRoom?.location}
              </DialogDescription>
            )}
          </DialogHeader>
          
          {bookingStep === 'time' && selectedRoom && bookingFormData && (
            <BookingCalendar
              room={selectedRoom}
              existingBookings={bookings.filter(b => b.roomId === selectedRoom.id)}
              onBookingComplete={(startTime, endTime) => handleTimeBookingComplete(startTime, endTime)}
            />
          )}
          
          {bookingStep === 'confirmation' && selectedRoom && bookingFormData && bookingFormData.startTime && bookingFormData.endTime && (
            <BookingConfirmation
              room={selectedRoom}
              bookingDetails={{
                title: bookingFormData.title,
                date: bookingFormData.date,
                startTime: bookingFormData.startTime,
                endTime: bookingFormData.endTime,
                attendees: bookingFormData.attendees,
                equipment: bookingFormData.equipment
              }}
              onConfirm={handleConfirmBooking}
              onCancel={handleCancelBooking}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomBooking;
