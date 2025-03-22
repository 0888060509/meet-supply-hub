
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { BookingFormData } from "@/components/BookingCalendar";
import { Calendar, Clock, Users, CheckSquare, MapPin, CalendarPlus, Clipboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { rooms } from "@/lib/data";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
  const getRandomConfirmationMessage = () => {
    const messages = [
      `${room?.name} is all yours—bring snacks!`,
      `Great choice! ${room?.name} has everything you need.`,
      `You're all set! Time to plan that awesome meeting.`,
      `Room secured! Don't forget the meeting agenda.`,
      `${room?.name} booked! Your team will thank you.`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const handleAddToCalendar = (type: string) => {
    // Format the booking details for calendar events
    const title = bookingData.title;
    const startDate = `${bookingData.date}T${bookingData.startTime}:00`;
    const endDate = `${bookingData.date}T${bookingData.endTime}:00`;
    const location = room?.location || '';
    const description = `Meeting in ${room?.name} with ${bookingData.attendees} attendees.`;
    
    let calendarUrl = '';
    
    switch(type) {
      case 'google':
        calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${encodeURIComponent(startDate.replace(/[-:]/g, ''))
        }/${encodeURIComponent(endDate.replace(/[-:]/g, ''))}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
        break;
      case 'outlook':
        calendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${encodeURIComponent(startDate)}&enddt=${encodeURIComponent(endDate)}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
        break;
      default:
        toast.error("Calendar type not supported");
        return;
    }
    
    // Open the calendar URL in a new tab
    window.open(calendarUrl, '_blank');
    toast.success(`Added to ${type} calendar`);
  };
  
  const handleCopyDetails = () => {
    const details = `
Meeting: ${bookingData.title}
Date: ${bookingData.date}
Time: ${bookingData.startTime} - ${bookingData.endTime}
Location: ${room?.name} (${room?.location})
Attendees: ${bookingData.attendees}
${bookingData.equipment.length > 0 ? `Equipment: ${bookingData.equipment.join(', ')}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(details);
    setCopiedToClipboard(true);
    toast.success("Meeting details copied to clipboard!");
    
    setTimeout(() => setCopiedToClipboard(false), 3000);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Booking Confirmation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription className="font-medium">
            {getRandomConfirmationMessage()}
          </AlertDescription>
        </Alert>
        
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
        
        <Separator className="my-2" />
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Add to your calendar</p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              onClick={() => handleAddToCalendar('google')}
            >
              <CalendarPlus className="h-4 w-4" />
              Google Calendar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              onClick={() => handleAddToCalendar('outlook')}
            >
              <CalendarPlus className="h-4 w-4" />
              Outlook
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`flex items-center gap-1 ${
                copiedToClipboard 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={handleCopyDetails}
            >
              <Clipboard className="h-4 w-4" />
              {copiedToClipboard ? 'Copied!' : 'Copy Details'}
            </Button>
          </div>
        </div>
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
