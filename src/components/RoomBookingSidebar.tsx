
import { useState } from "react";
import { Room, Booking } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { format } from "date-fns";

interface RoomBookingSidebarProps {
  rooms: Room[];
  userBookings: Booking[];
  onBookNow: (roomId: string) => void;
  onCancelBooking: (bookingId: string) => void;
}

const RoomBookingSidebar = ({
  rooms,
  userBookings,
  onBookNow,
  onCancelBooking,
}: RoomBookingSidebarProps) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      onCancelBooking(bookingToCancel);
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    }
  };

  return (
    <div className="w-full h-full bg-accent/10 border-r">
      <div className="p-4">
        <h3 className="text-lg font-medium mb-4">Room Booking</h3>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="all-rooms">
            <AccordionTrigger className="py-2 px-1 text-sm">
              All Rooms
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 py-1">
                {rooms.map((room) => (
                  <div key={room.id} className="group">
                    <div className="text-sm font-medium">{room.name}</div>
                    <div className="text-xs text-muted-foreground mb-1">{room.location}</div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs h-7"
                      onClick={() => onBookNow(room.id)}
                    >
                      Book Now
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="my-bookings">
            <AccordionTrigger className="py-2 px-1 text-sm">
              My Bookings
            </AccordionTrigger>
            <AccordionContent>
              {userBookings.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">
                  You don't have any room bookings yet.
                </div>
              ) : (
                <div className="space-y-3 py-1">
                  {userBookings.map((booking) => {
                    const room = rooms.find(r => r.id === booking.roomId);
                    return (
                      <div key={booking.id} className="group border-b pb-2 last:border-b-0">
                        <div className="text-sm font-medium">
                          {room?.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center mb-1">
                          {booking.date}, {booking.startTime} - {booking.endTime}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.title}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-1 text-xs h-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleCancelClick(booking.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
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

export default RoomBookingSidebar;
