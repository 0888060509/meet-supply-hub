
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Room, Booking } from "@/lib/data";
import { format } from "date-fns";
import { toast } from "sonner";

interface BookingCalendarProps {
  room: Room;
  existingBookings: Booking[];
  onBookingComplete: (bookingData: BookingFormData) => void;
}

export interface BookingFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  equipment: string[];
  roomId: string;
  roomName: string;
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00"
];

const attendeeOptions = [
  { value: "2", label: "1-2 people" },
  { value: "4", label: "3-4 people" },
  { value: "8", label: "5-8 people" },
  { value: "12", label: "9-12 people" },
  { value: "16", label: "13-16 people" },
  { value: "20", label: "17-20 people" },
];

const BookingCalendar = ({ 
  room, 
  existingBookings,
  onBookingComplete 
}: BookingCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [meetingTitle, setMeetingTitle] = useState<string>("");
  const [attendees, setAttendees] = useState<number>(0);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

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

  const handleEquipmentChange = (equipment: string) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipment)) {
        return prev.filter(item => item !== equipment);
      } else {
        return [...prev, equipment];
      }
    });
  };

  const handleBookNow = () => {
    if (!date || !startTime || !endTime || !meetingTitle || attendees === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const bookingData: BookingFormData = {
      title: meetingTitle,
      date: formatDate(date),
      startTime,
      endTime,
      attendees,
      equipment: selectedEquipment,
      roomId: room.id,
      roomName: room.name
    };

    // Send booking data to parent component
    onBookingComplete(bookingData);
    
    // Reset form
    setDate(new Date());
    setStartTime("");
    setEndTime("");
    setMeetingTitle("");
    setAttendees(0);
    setSelectedEquipment([]);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-1">
        <Label htmlFor="meeting-title">Meeting Title *</Label>
        <Input
          id="meeting-title"
          placeholder="Enter meeting title"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
        />
      </div>
      
      <div className="grid gap-1">
        <Label htmlFor="attendees">Number of Attendees *</Label>
        <Select 
          value={attendees.toString()} 
          onValueChange={(value) => setAttendees(Number(value))}
        >
          <SelectTrigger id="attendees">
            <SelectValue placeholder="Select number of attendees" />
          </SelectTrigger>
          <SelectContent>
            {attendeeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label className="mb-1 block">Select Date *</Label>
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
          <Label htmlFor="start-time">Start Time *</Label>
          <Select
            value={startTime}
            onValueChange={(value) => {
              setStartTime(value);
              setEndTime("");
            }}
            disabled={!date || availableStartTimes.length === 0}
          >
            <SelectTrigger id="start-time">
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
          <Label htmlFor="end-time">End Time *</Label>
          <Select
            value={endTime}
            onValueChange={setEndTime}
            disabled={!startTime || availableEndTimes.length === 0}
          >
            <SelectTrigger id="end-time">
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

      <div className="space-y-2">
        <Label>Required Equipment</Label>
        <div className="grid grid-cols-2 gap-2">
          {room.equipment.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox 
                id={`equipment-${item}`} 
                checked={selectedEquipment.includes(item)}
                onCheckedChange={() => handleEquipmentChange(item)}
              />
              <Label htmlFor={`equipment-${item}`} className="cursor-pointer">{item}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <Button 
        className="w-full mt-4" 
        onClick={handleBookNow}
        disabled={!date || !startTime || !endTime || !meetingTitle || attendees === 0}
      >
        Book {room.name}
      </Button>
    </div>
  );
};

export default BookingCalendar;
