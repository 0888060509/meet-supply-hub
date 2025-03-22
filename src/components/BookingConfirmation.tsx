
import { Button } from "@/components/ui/button";
import { Room } from "@/lib/data";
import { CalendarIcon, Clock, Users, CheckSquare, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface BookingConfirmationProps {
  room: Room;
  bookingDetails: {
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    attendees: number;
    equipment: string[];
  };
  onConfirm: () => void;
  onCancel: () => void;
}

const BookingConfirmation = ({ 
  room, 
  bookingDetails, 
  onConfirm,
  onCancel 
}: BookingConfirmationProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{bookingDetails.title}</h3>
        <p className="text-muted-foreground">Please confirm your booking details</p>
      </div>
      
      <div className="rounded-lg border bg-card p-4">
        <h4 className="font-medium mb-4">Booking Summary</h4>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-accent/50 rounded-full p-1.5">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium text-sm">Date</div>
              <div>{format(bookingDetails.date, "PPP")}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-accent/50 rounded-full p-1.5">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium text-sm">Time</div>
              <div>{bookingDetails.startTime} - {bookingDetails.endTime}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-accent/50 rounded-full p-1.5">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium text-sm">Attendees</div>
              <div>{bookingDetails.attendees} people</div>
            </div>
          </div>
          
          {bookingDetails.equipment && bookingDetails.equipment.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="bg-accent/50 rounded-full p-1.5">
                <CheckSquare className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-sm">Equipment</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {bookingDetails.equipment.map((item) => (
                    <Badge key={item} variant="outline" className="bg-accent/30">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-4">
        <h4 className="font-medium mb-4">Room Details</h4>
        
        <div className="space-y-4">
          <div>
            <div className="font-medium">{room.name}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {room.location}
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Capacity: {room.capacity} people</span>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Available Equipment</div>
            <div className="flex flex-wrap gap-1">
              {room.equipment.map((item, index) => (
                <Badge key={index} variant="outline" className={cn(
                  "bg-accent/30",
                  bookingDetails.equipment?.includes(item) && "bg-primary/20 border-primary/50"
                )}>
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onCancel}
        >
          Go Back
        </Button>
        <Button 
          className="flex-1"
          onClick={onConfirm}
        >
          Confirm Booking
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
