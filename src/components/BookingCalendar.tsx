
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Room, Booking } from "@/lib/data";
import { format } from "date-fns";
import { toast } from "sonner";
import { Clock } from "lucide-react";

interface BookingCalendarProps {
  room: Room;
  existingBookings: Booking[];
  onBookingComplete: (startTime: string, endTime: string) => void;
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00"
];

const BookingCalendar = ({ 
  room, 
  existingBookings,
  onBookingComplete 
}: BookingCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, "yyyy-MM-dd") : "";
  };

  const isTimeSlotAvailable = (time: string) => {
    if (!date) return false;
    
    const dateStr = formatDate(date);
    
    // Check if this time slot is already booked
    return !existingBookings.some(booking => {
      return (
        booking.date === dateStr &&
        booking.startTime <= time &&
        booking.endTime > time
      );
    });
  };

  const availableStartTimes = timeSlots.filter(time => 
    isTimeSlotAvailable(time)
  );

  const availableEndTimes = startTime 
    ? timeSlots.filter(time => 
        time > startTime && 
        timeSlots.slice(timeSlots.indexOf(startTime) + 1).includes(time) &&
        !existingBookings.some(booking => 
          booking.date === formatDate(date) &&
          booking.startTime < time &&
          booking.endTime > startTime
        )
      )
    : [];

  const handleBookNow = () => {
    if (!date || !startTime || !endTime) {
      toast.error("Please select both start and end times");
      return;
    }

    onBookingComplete(startTime, endTime);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-1 block">Select Date</Label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border pointer-events-auto"
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1">
          <Label htmlFor="start-time">Start Time</Label>
          <Select
            value={startTime}
            onValueChange={(value) => {
              setStartTime(value);
              setEndTime("");
            }}
            disabled={!date || availableStartTimes.length === 0}
          >
            <SelectTrigger id="start-time" className="flex gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select start time" />
            </SelectTrigger>
            <SelectContent>
              {availableStartTimes.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-1">
          <Label htmlFor="end-time">End Time</Label>
          <Select
            value={endTime}
            onValueChange={setEndTime}
            disabled={!startTime || availableEndTimes.length === 0}
          >
            <SelectTrigger id="end-time" className="flex gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select end time" />
            </SelectTrigger>
            <SelectContent>
              {availableEndTimes.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        className="w-full mt-4" 
        onClick={handleBookNow}
        disabled={!date || !startTime || !endTime}
      >
        Continue to Confirmation
      </Button>
    </div>
  );
};

export default BookingCalendar;
