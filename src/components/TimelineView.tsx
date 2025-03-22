import { useState } from "react";
import { Room, Booking } from "@/lib/data";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, Users, AlertTriangle } from "lucide-react";
import { format, isAfter, isBefore, isToday, set } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TimelineViewProps {
  rooms: Room[];
  bookings: Booking[];
  onSelectTimeSlot: (roomId: string, date: Date, startTime: string, endTime: string) => void;
}

const TimelineView = ({ rooms, bookings, onSelectTimeSlot }: TimelineViewProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [capacityFilter, setCapacityFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [timeSlotDuration, setTimeSlotDuration] = useState<number>(30); // Minutes - controlled by zoom slider
  const [attendees, setAttendees] = useState<number>(2);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{start: string, end: string} | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  
  // Equipment filter as a multi-select
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  
  // Get unique equipment options for filter
  const equipmentOptions = Array.from(
    new Set(rooms.flatMap(room => room.equipment))
  );
  
  // Generate time slots based on duration (zoom level)
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM
    
    const minutesInDay = (endHour - startHour) * 60;
    const slotCount = minutesInDay / timeSlotDuration;
    
    for (let i = 0; i < slotCount; i++) {
      const minutes = i * timeSlotDuration;
      const hour = Math.floor(minutes / 60) + startHour;
      const minute = minutes % 60;
      
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      
      slots.push(`${formattedHour}:${formattedMinute}`);
    }
    
    return slots;
  };
  
  // Time slots based on zoom level
  const timeSlots = generateTimeSlots();

  // Handle time range selection
  const handleTimeRangeSelect = (startTime: string, endTime: string) => {
    setSelectedTimeRange({ start: startTime, end: endTime });
    // Check if outside office hours (before 8am or after 6pm)
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);

    if (startHour < 8 || endHour > 18) {
      setWarningMessage("This time is outside regular office hours (8:00 AM - 6:00 PM). After-hours access may be required.");
    } else {
      setWarningMessage(null);
    }
  };
  
  // Filter rooms based on capacity, equipment, and search
  const filteredRooms = rooms.filter(room => {
    // First, enforce a capacity match based on attendees
    if (attendees > room.capacity) {
      return false;
    }

    // Filter by capacity
    const matchesCapacity = capacityFilter && capacityFilter !== "any-capacity"
      ? room.capacity >= parseInt(capacityFilter) 
      : true;
    
    // Filter by equipment (all selected equipment must be present)
    const matchesEquipment = selectedEquipment.length > 0
      ? selectedEquipment.every(eq => room.equipment.includes(eq))
      : true;
    
    // Filter by search term
    const matchesSearch = searchTerm
      ? room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesCapacity && matchesEquipment && matchesSearch;
  });
  
  // Check if a time slot is available for a room
  const isTimeSlotAvailable = (roomId: string, timeSlot: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    return !bookings.some(booking => {
      return (
        booking.roomId === roomId &&
        booking.date === dateStr &&
        booking.startTime <= timeSlot &&
        booking.endTime > timeSlot
      );
    });
  };
  
  // Check if a time slot is soon to be booked (within the next hour)
  const isTimeSlotSoonBooked = (roomId: string, timeSlot: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Only check for today's date
    if (format(date, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd")) {
      return false;
    }
    
    // Convert timeSlot to minutes since midnight
    const [hour, minute] = timeSlot.split(':').map(Number);
    const timeSlotMinutes = hour * 60 + minute;
    
    // Convert current time to minutes since midnight
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;
    
    // Check if timeSlot is within the next 60 minutes
    const isWithinNextHour = timeSlotMinutes >= currentMinutes && 
                            timeSlotMinutes <= currentMinutes + 60;
    
    // If it's within the next hour and will be booked
    return isWithinNextHour && !isTimeSlotAvailable(roomId, timeSlot);
  };
  
  // Get booking information for a tooltip
  const getBookingInfo = (roomId: string, timeSlot: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    const booking = bookings.find(booking => {
      return (
        booking.roomId === roomId &&
        booking.date === dateStr &&
        booking.startTime <= timeSlot &&
        booking.endTime > timeSlot
      );
    });
    
    return booking;
  };
  
  // Get next booking information for available slots
  const getNextBookingInfo = (roomId: string, timeSlot: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const [hour, minute] = timeSlot.split(':').map(Number);
    const timeSlotMinutes = hour * 60 + minute;
    
    // Find the next booking for this room on this date
    const roomBookings = bookings.filter(booking => 
      booking.roomId === roomId && booking.date === dateStr
    );
    
    // Sort bookings by start time
    const sortedBookings = roomBookings.sort((a, b) => {
      const [aHour, aMinute] = a.startTime.split(':').map(Number);
      const [bHour, bMinute] = b.startTime.split(':').map(Number);
      return (aHour * 60 + aMinute) - (bHour * 60 + bMinute);
    });
    
    // Find the next booking after this time slot
    const nextBooking = sortedBookings.find(booking => {
      const [bookingHour, bookingMinute] = booking.startTime.split(':').map(Number);
      const bookingMinutes = bookingHour * 60 + bookingMinute;
      return bookingMinutes > timeSlotMinutes;
    });
    
    return nextBooking;
  };
  
  // Handle clicking on a time slot
  const handleTimeSlotClick = (roomId: string, startTime: string) => {
    // Calculate end time based on time slot duration
    const startIndex = timeSlots.indexOf(startTime);
    
    // Default to 1-hour booking (adjust based on timeSlotDuration)
    const slotsForOneHour = 60 / timeSlotDuration;
    const endIndex = startIndex + slotsForOneHour;
    const endTime = endIndex < timeSlots.length ? timeSlots[endIndex] : "19:00";
    
    // Check if all slots in the hour are available
    let allSlotsAvailable = true;
    for (let i = startIndex; i < startIndex + slotsForOneHour && i < timeSlots.length; i++) {
      if (!isTimeSlotAvailable(roomId, timeSlots[i])) {
        allSlotsAvailable = false;
        break;
      }
    }
    
    if (allSlotsAvailable) {
      // Check if room capacity matches the number of attendees
      const selectedRoom = rooms.find(r => r.id === roomId);
      if (selectedRoom && attendees > selectedRoom.capacity) {
        setWarningMessage(`This room's capacity (${selectedRoom.capacity}) is smaller than your attendee count (${attendees}). Consider a larger room.`);
        return;
      }
      
      // Check equipment requirements
      if (selectedRoom && selectedEquipment.length > 0) {
        const missingEquipment = selectedEquipment.filter(eq => !selectedRoom.equipment.includes(eq));
        if (missingEquipment.length > 0) {
          setWarningMessage(`This room is missing required equipment: ${missingEquipment.join(', ')}`);
          return;
        }
      }
      
      // If all checks pass, select the time slot
      setWarningMessage(null);
      onSelectTimeSlot(roomId, date, startTime, endTime);
    }
  };

  // Toggle equipment selection
  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left panel - Meeting details and filters */}
      <div className="md:col-span-1 space-y-4 bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="font-medium text-lg mb-4">Meeting Requirements</h3>
        
        {/* Date selector - Most important, at the top */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2 border-primary/50">
                <Calendar className="h-4 w-4 text-primary" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
                className="bg-white pointer-events-auto"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Range Selector - Right after date */}
        <div className="space-y-2">
          <Label>Meeting Time</Label>
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  {selectedTimeRange?.start || "Start Time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="grid grid-cols-3 gap-1">
                  {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(time => (
                    <Button 
                      key={time} 
                      variant="outline" 
                      className="text-center"
                      onClick={() => {
                        // Set end time to 1 hour after start
                        const [hour, min] = time.split(':').map(Number);
                        const endHour = hour + 1 > 17 ? 18 : hour + 1;
                        const endTime = `${endHour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                        handleTimeRangeSelect(time, endTime);
                      }}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  {selectedTimeRange?.end || "End Time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="grid grid-cols-3 gap-1">
                  {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(time => (
                    <Button 
                      key={time} 
                      variant="outline" 
                      className="text-center"
                      disabled={selectedTimeRange?.start && selectedTimeRange.start >= time}
                      onClick={() => {
                        if (selectedTimeRange?.start) {
                          handleTimeRangeSelect(selectedTimeRange.start, time);
                        }
                      }}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Number of attendees */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Number of Attendees</Label>
            <span className="text-sm text-muted-foreground">{attendees}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setAttendees(prev => Math.max(1, prev - 1))}
            >
              -
            </Button>
            <div className="flex-1">
              <Slider
                value={[attendees]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => setAttendees(value[0])}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setAttendees(prev => Math.min(20, prev + 1))}
            >
              +
            </Button>
          </div>
        </div>
        
        {/* Equipment */}
        <div className="space-y-2">
          <Label>Required Equipment</Label>
          <div className="grid grid-cols-2 gap-2">
            {equipmentOptions.map((equipment) => (
              <div key={equipment} className="flex items-center space-x-2">
                <Checkbox 
                  id={`equipment-${equipment}`} 
                  checked={selectedEquipment.includes(equipment)}
                  onCheckedChange={() => toggleEquipment(equipment)}
                />
                <Label 
                  htmlFor={`equipment-${equipment}`}
                  className="text-sm cursor-pointer"
                >
                  {equipment}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Room search */}
        <div className="space-y-2">
          <Label>Search Rooms</Label>
          <Input
            placeholder="Room name or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Timeline zoom */}
        <div className="space-y-2 mt-6">
          <div className="flex justify-between">
            <Label>Timeline Zoom</Label>
            <span className="text-sm text-muted-foreground">{timeSlotDuration} min</span>
          </div>
          <Slider
            value={[timeSlotDuration]}
            min={15}
            max={60}
            step={15}
            onValueChange={(value) => setTimeSlotDuration(value[0])}
          />
        </div>
        
        {/* Available Rooms Count */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">Available Rooms</div>
          <div className="font-medium text-lg">{filteredRooms.length} of {rooms.length}</div>
          
          {selectedEquipment.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedEquipment.map(eq => (
                <Badge key={eq} variant="outline" className="text-xs">
                  {eq}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Warning message */}
        {warningMessage && (
          <Alert className="bg-amber-50 border-amber-200 mt-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-800">
              {warningMessage}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Right panel - Timeline */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Meeting Rooms Timeline</h3>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-400 mr-1"></div>
              <span>Soon Booked</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span>Booked</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden shadow-sm">
          {/* Timeline header (time slots) */}
          <div className="flex border-b">
            <div className="w-40 border-r p-2 bg-gray-100 font-medium">Room</div>
            <div className="flex-1 flex">
              {timeSlots.map((time, index) => (
                <div 
                  key={time} 
                  className={cn(
                    "flex-1 text-center p-1 text-xs font-medium",
                    index % 2 === 0 ? "border-l bg-gray-100" : "",
                    selectedTimeRange && time >= selectedTimeRange.start && time < selectedTimeRange.end ? "bg-blue-100" : ""
                  )}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
          
          {/* Room rows with time slots */}
          {filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No rooms match your criteria. Try adjusting your filters.
            </div>
          ) : (
            <TooltipProvider>
              {filteredRooms.map((room) => (
                <div key={room.id} className="flex border-b last:border-b-0">
                  <div className="w-40 border-r p-2 font-medium">
                    <div className="flex items-start justify-between">
                      <div>
                        <div>{room.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {room.capacity}
                        </div>
                      </div>
                      {attendees > room.capacity && (
                        <span className="text-xs text-red-500">Too small</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 flex">
                    {timeSlots.map((time, index) => {
                      const isAvailable = isTimeSlotAvailable(room.id, time);
                      const isSoonBooked = isTimeSlotSoonBooked(room.id, time);
                      const booking = getBookingInfo(room.id, time);
                      const nextBooking = isAvailable ? getNextBookingInfo(room.id, time) : null;
                      
                      // Highlight time slots within the selected time range
                      const isInSelectedRange = selectedTimeRange && 
                        time >= selectedTimeRange.start && 
                        time < selectedTimeRange.end;
                      
                      // Calculate if this slot should be shown as available within the selected range
                      const isAvailableInRange = isInSelectedRange && isAvailable;
                      const isConflictingWithRange = isInSelectedRange && !isAvailable;
                      
                      return (
                        <Tooltip key={`${room.id}-${time}`}>
                          <TooltipTrigger asChild>
                            <div 
                              className={cn(
                                "flex-1 h-14 border-r last:border-r-0 relative group transition-colors duration-150",
                                index % 2 === 0 ? "border-l" : "",
                                isAvailable 
                                  ? "bg-green-100 hover:bg-green-200 cursor-pointer" 
                                  : isSoonBooked
                                    ? "bg-amber-100 hover:bg-amber-200"
                                    : "bg-red-100 hover:bg-red-200",
                                isAvailableInRange && "bg-blue-200 hover:bg-blue-300 border border-blue-400",
                                isConflictingWithRange && "bg-red-300 hover:bg-red-400 border border-red-500"
                              )}
                              onClick={() => {
                                if (isAvailable) {
                                  handleTimeSlotClick(room.id, time);
                                }
                              }}
                            >
                              {!isAvailable && booking && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/70 text-white p-1 text-xs transition-all">
                                  <span className="text-center">
                                    {booking.title}<br/>
                                    {booking.startTime} - {booking.endTime}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            {isAvailable ? (
                              <div>
                                <div className="font-medium text-green-600">Available</div>
                                <div className="text-sm">
                                  {nextBooking ? (
                                    <span>Next booking starts at {nextBooking.startTime}</span>
                                  ) : (
                                    <span>Room is free for the rest of the day</span>
                                  )}
                                </div>
                                <div className="text-xs mt-1 text-muted-foreground">
                                  Click to book from {time}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-red-600">Booked</div>
                                {booking && (
                                  <>
                                    <div className="text-sm font-medium">{booking.title}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {booking.startTime} - {booking.endTime}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TooltipProvider>
          )}
        </div>

        {/* Quick time slot selection buttons */}
        {date && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium mr-2 mt-1">Quick Select:</span>
            {["Morning (9-12)", "Afternoon (1-5)", "Hour (Next Available)"].map(slot => (
              <Button
                key={slot}
                variant="outline"
                size="sm"
                className="bg-primary-50"
                onClick={() => {
                  // Handle quick slot selection
                  if (slot === "Morning (9-12)") {
                    handleTimeRangeSelect("09:00", "12:00");
                  } else if (slot === "Afternoon (1-5)") {
                    handleTimeRangeSelect("13:00", "17:00");
                  } else {
                    // Find next available hour
                    const now = new Date();
                    const currentHour = now.getHours();
                    const startHour = currentHour < 8 ? 8 : 
                                     currentHour >= 17 ? 8 : // If after 5pm, default to 8am next day
                                     currentHour + 1;
                    const endHour = startHour + 1 > 17 ? 18 : startHour + 1;
                    
                    handleTimeRangeSelect(
                      `${startHour.toString().padStart(2, '0')}:00`,
                      `${endHour.toString().padStart(2, '0')}:00`
                    );
                  }
                }}
              >
                {slot}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineView;
