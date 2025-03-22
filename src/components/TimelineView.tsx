
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
import { Slider } from "@/components/ui/slider";

interface TimelineViewProps {
  rooms: Room[];
  bookings: Booking[];
  onSelectTimeSlot: (roomId: string, date: Date, startTime: string, endTime: string) => void;
}

const TimelineView = ({ rooms, bookings, onSelectTimeSlot }: TimelineViewProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [capacityFilter, setCapacityFilter] = useState<string>("");
  const [equipmentFilter, setEquipmentFilter] = useState<string>("");
  const [timeSlotDuration, setTimeSlotDuration] = useState<number>(30); // Minutes - controlled by zoom slider
  
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
  
  // Get unique equipment options for filter
  const equipmentOptions = Array.from(
    new Set(rooms.flatMap(room => room.equipment))
  );
  
  // Filter rooms based on capacity and equipment
  const filteredRooms = rooms.filter(room => {
    const matchesCapacity = capacityFilter && capacityFilter !== "any-capacity"
      ? room.capacity >= parseInt(capacityFilter) 
      : true;
    
    const matchesEquipment = equipmentFilter && equipmentFilter !== "any-equipment"
      ? room.equipment.includes(equipmentFilter)
      : true;
    
    return matchesCapacity && matchesEquipment;
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
    
    return booking ? `${booking.title} (${booking.startTime} - ${booking.endTime})` : null;
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
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Meeting Rooms Timeline</h2>
        
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
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
      </div>

      <div className="flex gap-4 mb-4">
        <Select value={capacityFilter} onValueChange={setCapacityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Capacity" />
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
        
        <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any-equipment">Any equipment</SelectItem>
            {equipmentOptions.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {/* Timeline header (time slots) */}
        <div className="flex border-b">
          <div className="w-40 border-r p-2 bg-gray-50 font-medium">Room</div>
          <div className="flex-1 flex">
            {timeSlots.map((time, index) => (
              <div 
                key={time} 
                className={cn(
                  "flex-1 text-center p-1 text-xs",
                  index % 2 === 0 ? "border-l bg-gray-50" : ""
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
          filteredRooms.map((room) => (
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
                  const bookingInfo = getBookingInfo(room.id, time);
                  
                  return (
                    <div 
                      key={`${room.id}-${time}`}
                      className={cn(
                        "flex-1 h-12 border-r last:border-r-0 relative group",
                        index % 2 === 0 ? "border-l" : "",
                        isAvailable 
                          ? "bg-green-50 hover:bg-green-100 cursor-pointer" 
                          : "bg-red-50"
                      )}
                      onClick={() => {
                        if (isAvailable) {
                          handleTimeSlotClick(room.id, time);
                        }
                      }}
                      title={isAvailable ? "Available" : bookingInfo || "Booked"}
                    >
                      {!isAvailable && bookingInfo && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/70 text-white p-1 text-xs transition-opacity">
                          {bookingInfo}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Zoom slider */}
      <div className="mt-4 flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Zoom:</span>
        <div className="w-32">
          <Slider
            value={[timeSlotDuration]}
            min={15}
            max={60}
            step={15}
            onValueChange={(value) => setTimeSlotDuration(value[0])}
          />
        </div>
        <span className="text-sm text-muted-foreground">{timeSlotDuration} min</span>
      </div>
      
      <div className="flex items-center justify-start space-x-4 mt-2 text-sm text-muted-foreground">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-100 mr-1"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-50 mr-1"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
