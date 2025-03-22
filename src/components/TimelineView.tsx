
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

interface TimelineViewProps {
  rooms: Room[];
  bookings: Booking[];
  onSelectTimeSlot: (roomId: string, date: Date, startTime: string, endTime: string) => void;
}

const TimelineView = ({ rooms, bookings, onSelectTimeSlot }: TimelineViewProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [capacityFilter, setCapacityFilter] = useState<string>("");
  const [equipmentFilter, setEquipmentFilter] = useState<string>("");
  
  // Time slots from 8 AM to 6 PM in 30-minute increments
  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
  ];
  
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
  
  // Handle clicking on a time slot
  const handleTimeSlotClick = (roomId: string, startTime: string) => {
    // Find the next 1-hour time slot that is available
    const startIndex = timeSlots.indexOf(startTime);
    
    // Look for an hour-long slot (2 consecutive 30-min slots)
    if (startIndex < timeSlots.length - 1 && 
        isTimeSlotAvailable(roomId, timeSlots[startIndex]) && 
        isTimeSlotAvailable(roomId, timeSlots[startIndex + 1])) {
      
      onSelectTimeSlot(roomId, date, startTime, timeSlots[startIndex + 2] || "19:00");
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
                  return (
                    <div 
                      key={`${room.id}-${time}`}
                      className={cn(
                        "flex-1 h-12 border-r last:border-r-0",
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
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
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
