
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const room = rooms.find((r) => r.id === id);
  
  const [bookingOpen, setBookingOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<BookingFormData | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  useEffect(() => {
    if (!room && id) {
      toast.error("Room not found", {
        description: "We couldn't find the room you're looking for. Let's find you another great space!"
      });
      navigate("/rooms");
    }
  }, [id, room, navigate]);
  
  useEffect(() => {
    let timeout: number;
    if (bookingSuccess) {
      timeout = window.setTimeout(() => {
        setBookingSuccess(false);
      }, 5000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [bookingSuccess]);
  
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
    
    toast.success("Booking details submitted!", {
      description: "Just one more step to confirm your reservation"
    });
  };
  
  const handleConfirmBooking = () => {
    if (pendingBooking) {
      setBookingSuccess(true);
      toast.success(`Room booked successfully!`, {
        description: `${room.name} is now reserved for your meeting on ${pendingBooking.date}`
      });
      setConfirmationOpen(false);
      setPendingBooking(null);
      
      setTimeout(() => {
        navigate("/rooms?tab=bookings");
      }, 2000);
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
        
        <AnimatePresence>
          {bookingSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertDescription className="font-medium">
                  Awesome! Your room is booked. Redirecting to your bookings...
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        
        <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
        <p className="text-muted-foreground mt-1 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {room.location}
        </p>
      </div>
      
      <ResizablePanelGroup 
        direction="horizontal" 
        className="min-h-[600px] rounded-lg border"
      >
        <ResizablePanel defaultSize={70} minSize={40}>
          <div className="h-full p-6 overflow-auto">
            <div className="grid grid-cols-1 gap-6 h-full">
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
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={30} minSize={25}>
          <div className="h-full p-6">
            <RoomBookingSidebar />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
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
