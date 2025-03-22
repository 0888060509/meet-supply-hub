import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rooms } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import BookingCalendar, { BookingFormData } from "@/components/BookingCalendar";
import BookingConfirmation from "@/components/BookingConfirmation";
import RoomBookingSidebar from "@/components/RoomBookingSidebar";
import { toast } from "sonner";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from "@/components/ui/resizable";

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const room = rooms.find((r) => r.id === id);
  
  const [bookingOpen, setBookingOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<BookingFormData | null>(null);
  
  // If room not found, redirect to rooms page
  useEffect(() => {
    if (!room && id) {
      toast.error("Room not found");
      navigate("/rooms");
    }
  }, [id, room, navigate]);
  
  if (!room) {
    return null;
  }
  
  const handleBookNow = () => {
    setBookingOpen(true);
    setConfirmationOpen(false);
  };
  
  const handleBookingData = (bookingData: BookingFormData) => {
    setPendingBooking(bookingData);
    setBookingOpen(false);
    setConfirmationOpen(true);
  };
  
  const handleConfirmBooking = () => {
    if (pendingBooking) {
      // Here you would typically save the booking to your backend
      toast.success("Room booked successfully!");
      setConfirmationOpen(false);
      setPendingBooking(null);
      
      // Redirect to my bookings page
      navigate("/rooms?tab=bookings");
    }
  };
  
  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8">
        <Button 
          variant="ghost"
          className="flex items-center gap-1 mb-4"
          onClick={() => navigate("/rooms")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rooms
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
        <p className="text-muted-foreground mt-1 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {room.location}
        </p>
      </div>
      
      <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
        {/* Room Image and Details Panel */}
        <ResizablePanel defaultSize={70} minSize={40}>
          <div className="h-full p-6">
            <div className="grid grid-cols-1 gap-6 h-full">
              {/* Room Image */}
              <Card className="overflow-hidden">
                <div 
                  className="h-64 md:h-80 bg-accent/30 flex items-center justify-center"
                  style={{
                    backgroundImage: `url(${room.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!room.image && (
                    <Calendar className="h-16 w-16 text-muted-foreground/40" />
                  )}
                </div>
              </Card>

              {/* Room Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-2">About this room</h2>
                  <p className="text-muted-foreground">
                    A spacious meeting room with modern amenities, perfect for team meetings and presentations.
                  </p>
                  
                  <div className="mt-4">
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Room features</h3>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">{room.capacity} people</span>
                    </div>
                    
                    {room.equipment.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">Equipment</h3>
                        <div className="flex flex-wrap gap-1">
                          {room.equipment.map((item) => (
                            <Badge key={item} variant="outline" className="bg-accent/50">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ResizablePanel>
        
        {/* Resize Handle */}
        <ResizableHandle withHandle />
        
        {/* Sidebar Panel */}
        <ResizablePanel defaultSize={30} minSize={25}>
          <div className="h-full p-6">
            <RoomBookingSidebar />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <BookingCalendar
            room={room}
            existingBookings={[]}
            onBookingComplete={handleBookingData}
            initialData={pendingBooking}
          />
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
    </div>
  );
};

export default RoomDetails;
