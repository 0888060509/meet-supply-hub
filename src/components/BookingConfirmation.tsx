
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { BookingFormData } from "@/components/BookingCalendar";
import { Calendar, Clock, Users, CheckSquare, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { rooms } from "@/lib/data";

interface BookingConfirmationProps {
  bookingData: BookingFormData;
  onConfirm: () => void;
  onCancel: () => void;
}

const BookingConfirmation = ({ 
  bookingData, 
  onConfirm, 
  onCancel 
}: BookingConfirmationProps) => {
  const room = rooms.find(r => r.id === bookingData.roomId);
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Booking Confirmation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-lg">{bookingData.title}</h3>
          <p className="text-muted-foreground text-sm flex items-center mt-1">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            {room?.location}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Date
            </div>
            <div className="font-medium">{bookingData.date}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Attendees
            </div>
            <div className="font-medium">{bookingData.attendees} people</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Start Time
            </div>
            <div className="font-medium">{bookingData.startTime}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              End Time
            </div>
            <div className="font-medium">{bookingData.endTime}</div>
          </div>
        </div>
        
        {bookingData.equipment.length > 0 && (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground flex items-center">
              <CheckSquare className="h-4 w-4 mr-2" />
              Required Equipment
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {bookingData.equipment.map((item) => (
                <Badge key={item} variant="outline" className="bg-accent/50">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Back
        </Button>
        <Button onClick={onConfirm}>
          Confirm Booking
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingConfirmation;
