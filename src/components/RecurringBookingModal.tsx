import { useState, useEffect } from "react";
import { format, addDays, addWeeks, addMonths, isAfter, isBefore } from "date-fns";
import { Room, Booking } from "@/lib/data";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock, ArrowRight, Check, AlertTriangle, Edit, CalendarRange, CalendarDays, User, Users, Repeat, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface RecurringBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookings: RecurringBookingInstance[]) => void;
  initialData: {
    date: Date;
    startTime: string;
    endTime: string;
    attendees: number;
    selectedEquipment: string[];
  } | null;
  rooms: Room[];
  bookings: Booking[];
}

interface RecurringBookingInstance {
  date: string;
  roomId: string;
  originalRoomId: string;
  startTime: string;
  endTime: string;
  status: "available" | "conflicting" | "alternative";
}

const DAYS_OF_WEEK = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00"
];

const RecurringBookingModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  rooms,
  bookings,
}: RecurringBookingModalProps) => {
  const [step, setStep] = useState(1);
  const [recurrencePattern, setRecurrencePattern] = useState("weekly");
  const [frequency, setFrequency] = useState(1);
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
  const [monthlyType, setMonthlyType] = useState("dayOfMonth");
  const [endType, setEndType] = useState("occurrences");
  const [occurrences, setOccurrences] = useState(10);
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData ? addMonths(initialData.date, 3) : undefined
  );
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialData?.date);
  const [startTime, setStartTime] = useState(initialData?.startTime || "");
  const [endTime, setEndTime] = useState(initialData?.endTime || "");
  const [attendees, setAttendees] = useState(initialData?.attendees || 2);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(initialData?.selectedEquipment || []);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  
  const [bookingInstances, setBookingInstances] = useState<RecurringBookingInstance[]>([]);
  const [alert, setAlert] = useState(false);
  const [animateTransition, setAnimateTransition] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setStep(1);
      setAnimateTransition(false);
      
      setSelectedDate(initialData.date);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setAttendees(initialData.attendees);
      setSelectedEquipment(initialData.selectedEquipment || []);
      
      const availableRoom = rooms.find(room => 
        room.capacity >= initialData.attendees &&
        (initialData.selectedEquipment.length === 0 || 
          initialData.selectedEquipment.every(eq => room.equipment.includes(eq)))
      );
      if (availableRoom) {
        setSelectedRoomId(availableRoom.id);
      }
      
      const dayOfWeek = initialData.date.getDay();
      setWeeklyDays([dayOfWeek]);
    }
  }, [isOpen, initialData, rooms]);

  const handleClose = () => {
    if (step === 2) {
      setAlert(true);
    } else {
      onClose();
    }
  };

  const handleNext = () => {
    setAnimateTransition(true);
    setTimeout(() => {
      const instances = generateBookingInstances();
      setBookingInstances(instances);
      setStep(2);
      setAnimateTransition(false);
    }, 300);
  };

  const handleBack = () => {
    setAnimateTransition(true);
    setTimeout(() => {
      setStep(1);
      setAnimateTransition(false);
    }, 300);
  };

  const handleConfirm = () => {
    onConfirm(bookingInstances);
    onClose();
  };

  const handleWeeklyDayToggle = (day: number) => {
    if (weeklyDays.includes(day)) {
      setWeeklyDays(weeklyDays.filter(d => d !== day));
    } else {
      setWeeklyDays([...weeklyDays, day]);
    }
  };

  const generateBookingInstances = (): RecurringBookingInstance[] => {
    if (!selectedDate) return [];

    const instances: RecurringBookingInstance[] = [];
    let currentDate = new Date(selectedDate);
    let count = 0;

    while (
      (endType === "occurrences" && count < occurrences) ||
      (endType === "endDate" && endDate && isBefore(currentDate, endDate))
    ) {
      let shouldInclude = false;

      switch (recurrencePattern) {
        case "daily":
          shouldInclude = true;
          break;
        case "weekly":
          shouldInclude = weeklyDays.length > 0 && weeklyDays.includes(currentDate.getDay());
          break;
        case "monthly":
          if (monthlyType === "dayOfMonth") {
            shouldInclude = currentDate.getDate() === selectedDate.getDate();
          } else {
            shouldInclude = true;
          }
          break;
        case "custom":
          shouldInclude = true;
          break;
      }

      if (shouldInclude) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const instance: RecurringBookingInstance = {
          date: dateStr,
          roomId: selectedRoomId,
          originalRoomId: selectedRoomId,
          startTime,
          endTime,
          status: "available"
        };

        const hasConflict = bookings.some(booking => 
          booking.roomId === selectedRoomId &&
          booking.date === dateStr &&
          ((booking.startTime <= startTime && booking.endTime > startTime) ||
           (booking.startTime < endTime && booking.endTime >= endTime) ||
           (booking.startTime >= startTime && booking.endTime <= endTime))
        );

        if (hasConflict) {
          instance.status = "conflicting";
        }

        instances.push(instance);
        count++;
      }

      switch (recurrencePattern) {
        case "daily":
          currentDate = addDays(currentDate, frequency);
          break;
        case "weekly":
          currentDate = addDays(currentDate, 1);
          
          const daysPassed = 7;
          if (daysPassed >= 7 && !shouldInclude) {
            currentDate = addWeeks(currentDate, frequency - 1);
          }
          break;
        case "monthly":
          currentDate = addMonths(currentDate, frequency);
          break;
        case "custom":
          currentDate = addDays(currentDate, frequency);
          break;
      }
    }

    return instances;
  };

  const handleAlternativeRoomSelect = (instanceIndex: number, roomId: string) => {
    setBookingInstances(prev => {
      const updated = [...prev];
      updated[instanceIndex] = {
        ...updated[instanceIndex],
        roomId,
        status: "alternative"
      };
      return updated;
    });
  };

  const isFormValid = () => {
    if (!selectedRoomId) return false;
    if (!selectedDate) return false;
    if (!startTime || !endTime) return false;
    if (recurrencePattern === "weekly" && weeklyDays.length === 0) return false;
    if (endType === "endDate" && !endDate) return false;
    
    return true;
  };

  const isReviewValid = () => {
    return !bookingInstances.some(instance => instance.status === "conflicting");
  };

  const getFrequencyLabel = () => {
    switch (recurrencePattern) {
      case "daily": return "day(s)";
      case "weekly": return "week(s)";
      case "monthly": return "month(s)";
      case "custom": return "day(s)";
      default: return "occurrence(s)";
    }
  };

  const getSummaryText = () => {
    if (!selectedDate) return "";

    const room = rooms.find(r => r.id === selectedRoomId);
    const roomName = room ? room.name : "selected room";
    
    let recurrenceText = "";
    switch (recurrencePattern) {
      case "daily":
        recurrenceText = `every ${frequency > 1 ? `${frequency} days` : "day"}`;
        break;
      case "weekly":
        const dayNames = weeklyDays.map(day => 
          DAYS_OF_WEEK.find(d => d.value === day)?.label
        ).join(", ");
        recurrenceText = `every ${frequency > 1 ? `${frequency} weeks` : "week"} on ${dayNames}`;
        break;
      case "monthly":
        recurrenceText = `every ${frequency > 1 ? `${frequency} months` : "month"} on day ${selectedDate.getDate()}`;
        break;
      case "custom":
        recurrenceText = `every ${frequency} days`;
        break;
    }
    
    let endText = "";
    if (endType === "occurrences") {
      endText = `for ${occurrences} occurrences`;
    } else if (endDate) {
      endText = `until ${format(endDate, "MMMM do, yyyy")}`;
    }
    
    return `This booking will repeat ${recurrenceText} from ${startTime} to ${endTime}, starting ${format(selectedDate, "MMMM do, yyyy")}, ${endText} in ${roomName}.`;
  };

  const isRoomAvailableForInstance = (roomId: string, instanceDate: string, startTime: string, endTime: string): boolean => {
    return !bookings.some(booking => 
      booking.roomId === roomId &&
      booking.date === instanceDate &&
      ((booking.startTime <= startTime && booking.endTime > startTime) ||
       (booking.startTime < endTime && booking.endTime >= endTime) ||
       (booking.startTime >= startTime && booking.endTime <= endTime))
    );
  };

  const doesRoomMeetRequirements = (room: Room): boolean => {
    return room.capacity >= attendees &&
      (!selectedEquipment.length || 
        selectedEquipment.every(eq => room.equipment.includes(eq)));
  };

  return (
    <>
      <AlertDialog open={alert} onOpenChange={setAlert}>
        <AlertDialogContent className="pointer-events-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Recurring Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? All your recurring booking settings will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlert(false)}>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>Yes, Cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden bg-white p-0 pointer-events-auto">
          <DialogHeader className="p-6 pb-3 border-b">
            <DialogTitle className="text-xl font-semibold">
              {step === 1 ? "Set Up Recurring Booking" : "Review Recurring Booking"}
            </DialogTitle>
            {step === 1 && (
              <DialogDescription className="text-sm text-muted-foreground">
                Create multiple bookings with a repeating pattern
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="relative overflow-hidden p-6 pt-4">
            <div className={cn(
              "transition-all duration-300 transform",
              step !== 1 && "absolute inset-0 opacity-0",
              animateTransition && (step === 1 ? "translate-x-0" : "-translate-x-full")
            )}>
              <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 pointer-events-auto">
                <div className="bg-accent/10 p-4 rounded-md">
                  <div className="text-sm mb-4 font-medium">
                    Booking Details
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Start Time</Label>
                      <Select value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger className="h-9 text-sm pointer-events-auto">
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                        <SelectContent className="pointer-events-auto">
                          {timeSlots.slice(0, -1).map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">End Time</Label>
                      <Select 
                        value={endTime} 
                        onValueChange={setEndTime}
                        disabled={!startTime}
                      >
                        <SelectTrigger className="h-9 text-sm pointer-events-auto">
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                        <SelectContent className="pointer-events-auto">
                          {timeSlots.filter(time => time > startTime).map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-9 text-sm pointer-events-auto",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-50 pointer-events-auto" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                            className="pointer-events-auto"
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Attendees</Label>
                      <Input 
                        type="number" 
                        value={attendees} 
                        onChange={(e) => setAttendees(parseInt(e.target.value) || 0)} 
                        min={1}
                        max={50}
                        className="h-9 text-sm pointer-events-auto"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Room</Label>
                  <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                    <SelectTrigger className="h-10 pointer-events-auto">
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent className="pointer-events-auto">
                      {rooms
                        .filter(room => room.capacity >= attendees)
                        .map(room => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name} (Capacity: {room.capacity})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedEquipment.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Required Equipment</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedEquipment.map(eq => (
                        <Badge key={eq} variant="outline" className="text-xs">
                          {eq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Recurrence Pattern</Label>
                    <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <Label className="text-sm font-medium">Frequency</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min={1}
                        max={99}
                        value={frequency}
                        onChange={(e) => setFrequency(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 h-9 text-sm"
                      />
                      <span className="text-sm text-muted-foreground">
                        {getFrequencyLabel()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {recurrencePattern === "weekly" && (
                  <div className="space-y-3 p-4 bg-accent/5 rounded-md">
                    <Label className="text-sm font-medium">Repeat on</Label>
                    <div className="flex flex-wrap gap-3 mt-2 justify-center sm:justify-start">
                      {DAYS_OF_WEEK.map((day) => (
                        <Button
                          key={day.value}
                          type="button"
                          size="sm"
                          variant={weeklyDays.includes(day.value) ? "default" : "outline"}
                          className="w-10 h-10 rounded-full p-0"
                          onClick={() => handleWeeklyDayToggle(day.value)}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {recurrencePattern === "monthly" && (
                  <div className="space-y-3 p-4 bg-accent/5 rounded-md">
                    <Label className="text-sm font-medium">Monthly Options</Label>
                    <RadioGroup value={monthlyType} onValueChange={setMonthlyType} className="mt-2">
                      <div className="flex items-center space-x-2 mb-3 p-2 rounded-md hover:bg-accent/10">
                        <RadioGroupItem value="dayOfMonth" id="dayOfMonth" />
                        <Label htmlFor="dayOfMonth" className="cursor-pointer text-sm">
                          Day {selectedDate?.getDate() || ""} of the month
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/10">
                        <RadioGroupItem value="positionDay" id="positionDay" disabled />
                        <Label htmlFor="positionDay" className="cursor-pointer text-sm text-muted-foreground">
                          First {format(selectedDate || new Date(), "EEEE")} of the month
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
                
                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-sm font-medium">End Condition</Label>
                  <RadioGroup value={endType} onValueChange={setEndType} className="space-y-3">
                    <div className="flex items-center space-x-2 bg-accent/5 p-3 rounded-md">
                      <RadioGroupItem value="occurrences" id="occurrences" />
                      <div className="flex items-center gap-2 flex-1">
                        <Label htmlFor="occurrences" className="cursor-pointer text-sm whitespace-nowrap">After</Label>
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          value={occurrences}
                          onChange={(e) => setOccurrences(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 h-9 text-sm mx-1"
                          disabled={endType !== "occurrences"}
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">occurrences</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-accent/5 p-3 rounded-md">
                      <RadioGroupItem value="endDate" id="endDate" />
                      <div className="flex items-center gap-2 flex-1">
                        <Label htmlFor="endDate" className="cursor-pointer text-sm whitespace-nowrap">On date</Label>
                        <div className="flex-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={endType !== "endDate"}
                                className={cn(
                                  "justify-start text-left font-normal w-full h-9 text-sm",
                                  !endDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                                {endDate ? format(endDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-50 pointer-events-auto" align="start">
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                initialFocus
                                className="pointer-events-auto"
                                disabled={(date) => selectedDate ? isBefore(date, selectedDate) : false}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "transition-all duration-300 transform",
              step !== 2 && "absolute inset-0 opacity-0",
              animateTransition && (step === 2 ? "translate-x-0" : "translate-x-full")
            )}>
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 pointer-events-auto">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-md text-sm shadow-sm border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <CalendarRange className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Booking Summary</h4>
                      <p className="text-blue-700">{getSummaryText()}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> {bookingInstances.length} instances
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                          <Users className="h-3 w-3" /> {attendees} attendees
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {startTime} - {endTime}
                        </Badge>
                        {selectedRoomId && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                            <Building className="h-3 w-3" /> {rooms.find(r => r.id === selectedRoomId)?.name || "Selected room"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    Generated Booking Instances
                  </Label>
                  <ScrollArea className="h-[300px] rounded-md border p-1 pointer-events-auto">
                    <div className="space-y-3 p-2">
                      {bookingInstances.length > 0 ? (
                        bookingInstances.map((instance, index) => {
                          const instanceRoom = rooms.find(r => r.id === instance.roomId);
                          const originalRoom = rooms.find(r => r.id === instance.originalRoomId);
                          
                          return (
                            <div 
                              key={`${instance.date}-${index}`}
                              className={cn(
                                "p-3 rounded-md border flex flex-col space-y-2",
                                instance.status === "available" && "bg-green-50 border-green-200",
                                instance.status === "conflicting" && "bg-red-50 border-red-200 animate-pulse",
                                instance.status === "alternative" && "bg-amber-50 border-amber-200"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-sm">
                                    {format(new Date(instance.date), "MMMM do, yyyy")}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {instance.startTime} - {instance.endTime}
                                  </div>
                                  {instance.status === "alternative" && (
                                    <div className="text-xs text-amber-600 mt-1 flex items-center">
                                      <ArrowRight className="h-3 w-3 mr-1" />
                                      Alternative: {instanceRoom?.name} (instead of {originalRoom?.name})
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  {instance.status === "available" && (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                                      <Check className="h-3 w-3 mr-1" /> Available
                                    </Badge>
                                  )}
                                  {instance.status === "conflicting" && (
                                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" /> Conflicting
                                    </Badge>
                                  )}
                                  {instance.status === "alternative" && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                                        <Check className="h-3 w-3 mr-1" /> Alternative Selected
                                      </Badge>
                                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                                        setBookingInstances(prev => {
                                          const updated = [...prev];
                                          updated[index] = {
                                            ...updated[index],
                                            status: "conflicting"
                                          };
                                          return updated;
                                        });
                                      }}>
                                        <Edit className="h-3.5 w-3.5 text-amber-800" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {instance.status === "conflicting" && (
                                <div className="pt-2 mt-1 border-t border-red-200">
                                  <Label className="text-xs mb-2 block">Select Alternative Room</Label>
                                  <Select 
                                    onValueChange={(roomId) => handleAlternativeRoomSelect(index, roomId)}
                                  >
                                    <SelectTrigger className="h-8 text-xs pointer-events-auto">
                                      <SelectValue placeholder="Choose alternative room" />
                                    </SelectTrigger>
                                    <SelectContent className="pointer-events-auto z-50">
                                      {rooms
                                        .filter(roomItem => {
                                          const isAvailable = isRoomAvailableForInstance(
                                            roomItem.id, 
                                            instance.date, 
                                            instance.startTime, 
                                            instance.endTime
                                          );
                                          const meetsRequirements = doesRoomMeetRequirements(roomItem);
                                          return isAvailable && meetsRequirements;
                                        })
                                        .map(roomItem => (
                                          <SelectItem key={roomItem.id} value={roomItem.id}>
                                            {roomItem.name} (Capacity: {roomItem.capacity})
                                          </SelectItem>
                                        ))
                                      }
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-muted-foreground text-sm">
                          No instances generated yet. Please go back and configure the recurrence pattern.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-6 pt-4 border-t">
            {step === 1 ? (
              <div className="w-full flex justify-between">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!isFormValid()}
                >
                  Next
                </Button>
              </div>
            ) : (
              <div className="w-full flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleConfirm}
                  disabled={!isReviewValid()}
                >
                  Confirm {bookingInstances.length} Bookings
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecurringBookingModal;
