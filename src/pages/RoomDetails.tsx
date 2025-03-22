
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { rooms } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, CheckSquare, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import BookingCalendar, { BookingFormData } from "@/components/BookingCalendar";
import BookingConfirmation from "@/components/BookingConfirmation";
import { toast } from "sonner";

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Room Image */}
        <div className="md:col-span-2">
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
        </div>
        
        {/* Room Details and Booking */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Room Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Capacity</h3>
                <p className="flex items-center mt-1">
                  <Users className="h-4 w-4 mr-2" />
                  {room.capacity} people
                </p>
              </div>
              
              {room.equipment.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Equipment</h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {room.equipment.map((item) => (
                      <Badge key={item} variant="outline" className="bg-accent/50">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1 text-sm">
                  {room.description || "A spacious meeting room with modern amenities, perfect for team meetings and presentations."}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleBookNow}>
                Book This Room
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book {room.name}</DialogTitle>
            <DialogDescription className="flex items-center text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1 inline" />
              {room.location}
            </DialogDescription>
          </DialogHeader>
          
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
