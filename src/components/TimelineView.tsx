import { useState } from "react";
import { Room, Booking } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, Users, AlertTriangle, Projector, MonitorCheck, Wifi, Tv, Presentation, Mic2, StickyNote } from "lucide-react";
import { format, isAfter, isBefore, isToday, set } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import RecurringBookingModal from "./RecurringBookingModal";
import { toast } from "sonner";

const equipmentIcons: Record<string, React.ReactNode> = {
  "Projector": <Projector className="h-4 w-4" />,
  "Whiteboard": <StickyNote className="h-4 w-4" />,
  "Video Conference": <Tv className="h-4 w-4" />,
  "Teleconference": <Mic2 className="h-4 w-4" />,
  "Display Screen": <MonitorCheck className="h-4 w-4" />,
  "WiFi": <Wifi className="h-4 w-4" />,
  "Presentation Setup": <Presentation className="h-4 w-4" />
};

interface TimelineViewProps {
  rooms: Room[];
  bookings: Booking[];
  onSelectTimeSlot: (roomId: string, date: Date, startTime: string, endTime: string) => void;
}

const TimelineView = ({
  rooms,
  bookings,
  onSelectTimeSlot
}: TimelineViewProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [capacityFilter, setCapacityFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [timeSlotDuration, setTimeSlotDuration] = useState<number>(30); // Minutes - controlled by zoom slider
  const [attendees, setAttendees] = useState<number>(2);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);

  const equipmentOptions = Array.from(new Set(rooms.flatMap(room => room.equipment)));

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

  const timeSlots = generateTimeSlots();

  const handleTimeRangeSelect = (startTime: string, endTime: string) => {
    setSelectedTimeRange({
      start: startTime,
      end: endTime
    });
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    if (startHour < 8 || endHour > 18) {
      setWarningMessage("This time is outside regular office hours (8:00 AM - 6:00 PM). After-hours access may be required.");
    } else {
      setWarningMessage(null);
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (attendees > room.capacity) {
      return false;
    }
    const matchesCapacity = capacityFilter && capacityFilter !== "any-capacity" ? room.capacity >= parseInt(capacityFilter) : true;
    const matchesEquipment = selectedEquipment.length > 0 ? selectedEquipment.every(eq => room.equipment.includes(eq)) : true;
    const matchesSearch = searchTerm ? room.name.toLowerCase().includes(searchTerm.toLowerCase()) || room.location.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return matchesCapacity && matchesEquipment && matchesSearch;
  });

  const isTimeSlotAvailable = (roomId: string, timeSlot: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return !bookings.some(booking => {
      return booking.roomId === roomId && booking.date === dateStr && booking.startTime <= timeSlot && booking.endTime > timeSlot;
    });
  };

  const isTimeSlotSoonBooked = (roomId: string, timeSlot: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    if (format(date, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd")) {
      return false;
    }
    const [hour, minute] = timeSlot.split(':').map(Number);
    const timeSlotMinutes = hour * 60 + minute;
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;
    const isWithinNextHour = timeSlotMinutes >= currentMinutes && timeSlotMinutes <= currentMinutes + 60;
    return isWithinNextHour && !isTimeSlotAvailable(roomId, timeSlot);
  };

  const getBookingInfo = (roomId: string, timeSlot: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const booking = bookings.find(booking => {
      return booking.roomId === roomId && booking.date === dateStr && booking.startTime <= timeSlot && booking.endTime > timeSlot;
    });
    return booking;
  };

  const getNextBookingInfo = (roomId: string, timeSlot: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const [hour, minute] = timeSlot.split(':').map(Number);
    const timeSlotMinutes = hour * 60 + minute;
    const roomBookings = bookings.filter(booking => booking.roomId === roomId && booking.date === dateStr);
    const sortedBookings = roomBookings.sort((a, b) => {
      const [aHour, aMinute] = a.startTime.split(':').map(Number);
      const [bHour, bMinute] = b.startTime.split(':').map(Number);
      return aHour * 60 + aMinute - (bHour * 60 + bMinute);
    });
    const nextBooking = sortedBookings.find(booking => {
      const [bookingHour, bookingMinute] = booking.startTime.split(':').map(Number);
      const bookingMinutes = bookingHour * 60 + bookingMinute;
      return bookingMinutes > timeSlotMinutes;
    });
    return nextBooking;
  };

  const handleTimeSlotClick = (roomId: string, startTime: string) => {
    const startIndex = timeSlots.indexOf(startTime);
    const slotsForOneHour = 60 / timeSlotDuration;
    const endIndex = startIndex + slotsForOneHour;
    const endTime = endIndex < timeSlots.length ? timeSlots[endIndex] : "19:00";
    let allSlotsAvailable = true;
    for (let i = startIndex; i < startIndex + slotsForOneHour && i < timeSlots.length; i++) {
      if (!isTimeSlotAvailable(roomId, timeSlots[i])) {
        allSlotsAvailable = false;
        break;
      }
    }
    if (allSlotsAvailable) {
      const selectedRoom = rooms.find(r => r.id === roomId);
      if (selectedRoom && attendees > selectedRoom.capacity) {
        setWarningMessage(`This room's capacity (${selectedRoom.capacity}) is smaller than your attendee count (${attendees}). Consider a larger room.`);
        return;
      }
      if (selectedRoom && selectedEquipment.length > 0) {
        const missingEquipment = selectedEquipment.filter(eq => !selectedRoom.equipment.includes(eq));
        if (missingEquipment.length > 0) {
          setWarningMessage(`This room is missing required equipment: ${missingEquipment.join(', ')}`);
          return;
        }
      }
      setWarningMessage(null);
      onSelectTimeSlot(roomId, date, startTime, endTime);
    }
  };

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev => prev.includes(equipment) ? prev.filter(e => e !== equipment) : [...prev, equipment]);
  };

  const handleRecurringConfirm = (bookingInstances: any[]) => {
    toast.success(`${bookingInstances.length} recurring bookings created successfully!`);
    console.log("Recurring bookings created:", bookingInstances);
  };

  const canMakeRecurring = selectedTimeRange !== null && selectedTimeRange.start && selectedTimeRange.end;

  const zoomMilestones = [15, 30, 45, 60];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-4 h-[calc(100vh-10rem)]">
      <div className="lg:col-span-3 xl:col-span-3 h-full">
        <Card className="shadow-sm h-full flex flex-col">
          <CardHeader className="pb-2 flex items-center">
            <CardTitle className="text-lg">Meeting Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-3 sm:p-4 overflow-auto flex-grow">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 border-primary/50 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent mode="single" selected={date} onSelect={newDate => newDate && setDate(newDate)} initialFocus className="bg-white pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Meeting Time</Label>
              <div className="grid grid-cols-1 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-xs">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      {selectedTimeRange?.start || "Start Time"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="grid grid-cols-2 gap-1">
                      {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(time => (
                        <Button
                          key={time}
                          variant="outline"
                          className="text-center text-xs"
                          onClick={() => {
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
                    <Button variant="outline" className="w-full justify-start text-xs">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      {selectedTimeRange?.end || "End Time"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="grid grid-cols-2 gap-1">
                      {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(time => (
                        <Button
                          key={time}
                          variant="outline"
                          className="text-center text-xs"
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
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Attendees</Label>
                <span className="text-xs text-muted-foreground">{attendees}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setAttendees(prev => Math.max(1, prev - 1))}>
                  -
                </Button>
                <div className="flex-1 flex items-center">
                  <Slider value={[attendees]} min={1} max={20} step={1} onValueChange={value => setAttendees(value[0])} />
                </div>
                <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setAttendees(prev => Math.min(20, prev + 1))}>
                  +
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Required Equipment</Label>
              <ScrollArea className="h-24 w-full rounded-md border p-2">
                <div className="space-y-1">
                  {equipmentOptions.map(equipment => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox
                        id={`equipment-${equipment}`}
                        checked={selectedEquipment.includes(equipment)}
                        onCheckedChange={() => toggleEquipment(equipment)}
                        className="h-3.5 w-3.5"
                      />
                      <Label htmlFor={`equipment-${equipment}`} className="text-xs cursor-pointer flex items-center gap-1">
                        {equipmentIcons[equipment] || <AlertTriangle className="h-3 w-3" />}
                        {equipment}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Search Rooms</Label>
              <Input
                placeholder="Room name or location"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Timeline Zoom</Label>
              </div>
              <div className="flex items-center">
                <Slider
                  value={[timeSlotDuration]}
                  min={15}
                  max={60}
                  step={15}
                  onValueChange={value => setTimeSlotDuration(value[0])}
                  className="mt-2"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                {zoomMilestones.map(milestone => (
                  <span key={milestone} className="text-center">{milestone} min</span>
                ))}
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <div className="text-xs text-muted-foreground mb-1">Available Rooms</div>
              <div className="font-medium text-sm">{filteredRooms.length} of {rooms.length}</div>
              
              {selectedEquipment.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedEquipment.map(eq => (
                    <Badge key={eq} variant="outline" className="text-[10px] flex items-center gap-1 px-1.5 py-0.5">
                      {equipmentIcons[eq] || <AlertTriangle className="h-2.5 w-2.5" />}
                      {eq}
                    </Badge>
                  ))}
                </div>
              )}
              
              {selectedTimeRange?.start && selectedTimeRange?.end && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 gap-1.5 bg-primary-50"
                  onClick={() => setRecurringModalOpen(true)}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Make this recurring
                </Button>
              )}
            </div>

            {warningMessage && (
              <Alert className="bg-amber-50 border-amber-200 mt-2 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <AlertDescription className="text-amber-800 text-xs">
                  {warningMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-9 xl:col-span-9 h-full">
        <Card className="shadow-sm h-full flex flex-col">
          <CardHeader className="pb-2 flex items-center z-10 sticky top-0 bg-background">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-lg">
                {isToday(date) ? "Today's Schedule" : format(date, "EEEE, MMMM do, yyyy")}
              </CardTitle>
              
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
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-hidden">
            <div className="border rounded-lg overflow-hidden h-full flex flex-col">
              <div className="relative flex flex-col h-full">
                <div className="sticky top-0 z-20 flex border-b bg-white">
                  <div className="w-[200px] min-w-[200px] border-r bg-gray-100 flex items-center p-4 sticky left-0 z-10">
                    <span className="font-medium">Room</span>
                  </div>
                  <div className="overflow-hidden" style={{ width: 'calc(100% - 200px)' }} id="header-scroll-container">
                    <div className="flex min-w-max h-full">
                      {timeSlots.map((time, index) => (
                        <div
                          key={time}
                          className={cn(
                            "min-w-[60px] w-[60px] flex-shrink-0 flex items-center justify-center p-4 text-xs font-medium",
                            index % 2 === 0 ? "border-l bg-gray-100" : "",
                            selectedTimeRange && time >= selectedTimeRange.start && time < selectedTimeRange.end ? "bg-blue-100" : ""
                          )}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {filteredRooms.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No rooms match your criteria. Try adjusting your filters.
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                    <div className="relative">
                      <div className="w-[200px] min-w-[200px] bg-white border-r absolute left-0 z-10 h-full">
                        {filteredRooms.map(room => (
                          <div key={`fixed-${room.id}`} className="p-4 font-medium border-b last:border-b-0 h-[80px]">
                            <div className="flex flex-col h-full justify-center">
                              <div className="font-medium">{room.name}</div>
                              
                              <div className="flex flex-wrap gap-1 mt-1">
                                {room.equipment.map(eq => (
                                  <Tooltip key={eq}>
                                    <TooltipTrigger>
                                      <div className="text-primary">
                                        {equipmentIcons[eq] || <AlertTriangle className="h-3.5 w-3.5" />}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">{eq}</TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>

                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Users className="h-3 w-3" />
                                <span>Capacity: {room.capacity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="overflow-x-auto ml-[200px]" id="timeline-content" onScroll={e => {
                        const headerContainer = document.getElementById('header-scroll-container');
                        if (headerContainer) {
                          headerContainer.scrollLeft = e.currentTarget.scrollLeft;
                        }
                      }}>
                        <div className="min-w-max">
                          <TooltipProvider>
                            {filteredRooms.map(room => (
                              <div key={room.id} className="border-b last:border-b-0 h-[80px]">
                                <div className="hidden">{room.name}</div>
                                
                                <div className="flex h-full">
                                  {timeSlots.map((time, index) => {
                                    const isAvailable = isTimeSlotAvailable(room.id, time);
                                    const isSoonBooked = isTimeSlotSoonBooked(room.id, time);
                                    const booking = getBookingInfo(room.id, time);
                                    const nextBooking = isAvailable ? getNextBookingInfo(room.id, time) : null;
                                    const isInSelectedRange = selectedTimeRange && time >= selectedTimeRange.start && time < selectedTimeRange.end;
                                    const isAvailableInRange = isInSelectedRange && isAvailable;
                                    const isConflictingWithRange = isInSelectedRange && !isAvailable;
                                    
                                    return (
                                      <Tooltip key={`${room.id}-${time}`}>
                                        <TooltipTrigger asChild>
                                          <div
                                            className={cn(
                                              "min-w-[60px] w-[60px] flex-shrink-0 border-r last:border-r-0 relative transition-colors duration-150 h-full",
                                              index % 2 === 0 ? "border-l" : "",
                                              isAvailable ? "bg-green-100 hover:bg-green-200 cursor-pointer" : isSoonBooked ? "bg-amber-100 hover:bg-amber-200" : "bg-red-100 hover:bg-red-200",
                                              isAvailableInRange && "bg-blue-200 hover:bg-blue-300 border border-blue-400",
                                              isConflictingWithRange && "bg-red-300 hover:bg-red-400 border border-red-500"
                                            )}
                                            onClick={() => {
                                              if (isAvailable) {
                                                handleTimeSlotClick(room.id, time);
                                              }
                                            }}
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-xs z-50">
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
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <RecurringBookingModal
        isOpen={recurringModalOpen}
        onClose={() => setRecurringModalOpen(false)}
        onConfirm={handleRecurringConfirm}
        initialData={selectedTimeRange ? {
          date,
          startTime: selectedTimeRange.start,
          endTime: selectedTimeRange.end,
          attendees,
          selectedEquipment
        } : null}
        rooms={rooms}
        bookings={bookings}
      />
    </div>
  );
};

export default TimelineView;
