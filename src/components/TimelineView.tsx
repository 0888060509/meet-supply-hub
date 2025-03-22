
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
import { Calendar } from "lucide-react";
import { format } from "date-fns";
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
  
  // Filter rooms based on capacity, equipment, and search
  const filteredRooms = rooms.filter(room => {
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
        
        {/* Date selector */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
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
        
        {/* Room capacity */}
        <div className="space-y-2">
          <Label>Room Capacity</Label>
          <Select value={capacityFilter} onValueChange={setCapacityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Any capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any-capacity">Any capacity</SelectItem>
              <SelectItem value="2">2+ people</SelectItem>
              <SelectItem value="4">4+ people</SelectItem>
              <SelectItem value="8">8+ people</SelectItem>
              <SelectItem value="12">12+ people</SelectItem>
              <SelectItem value="16">16+ people</SelectItem>
            </SelectContent>
          </Select>
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
              <div className="w-3 h-3 rounded-full bg-amber-300 mr-1"></div>
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
                    index % 2 === 0 ? "border-l bg-gray-100" : ""
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
                    <div>{room.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Capacity: {room.capacity}
                    </div>
                  </div>
                  <div className="flex-1 flex">
                    {timeSlots.map((time, index) => {
                      const isAvailable = isTimeSlotAvailable(room.id, time);
                      const isSoonBooked = isTimeSlotSoonBooked(room.id, time);
                      const booking = getBookingInfo(room.id, time);
                      const nextBooking = isAvailable ? getNextBookingInfo(room.id, time) : null;
                      
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
                                    ? "bg-amber-100"
                                    : "bg-red-100 hover:bg-red-200"
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
      </div>
    </div>
  );
};

export default TimelineView;
