
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
import { Calendar as CalendarIcon, Clock, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [bookingInstances, setBookingInstances] = useState<RecurringBookingInstance[]>([]);
  const [alert, setAlert] = useState(false);
  
  const [animateTransition, setAnimateTransition] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setStep(1);
      setAnimateTransition(false);
      
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
    if (!initialData) return [];

    const instances: RecurringBookingInstance[] = [];
    let currentDate = new Date(initialData.date);
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
            shouldInclude = currentDate.getDate() === initialData.date.getDate();
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
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          status: "available"
        };

        const hasConflict = bookings.some(booking => 
          booking.roomId === selectedRoomId &&
          booking.date === dateStr &&
          ((booking.startTime <= initialData.startTime && booking.endTime > initialData.startTime) ||
           (booking.startTime < initialData.endTime && booking.endTime >= initialData.endTime) ||
           (booking.startTime >= initialData.startTime && booking.endTime <= initialData.endTime))
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
    if (!initialData) return "";

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
        recurrenceText = `every ${frequency > 1 ? `${frequency} months` : "month"} on day ${initialData.date.getDate()}`;
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
    
    return `This booking will repeat ${recurrenceText} from ${initialData.startTime} to ${initialData.endTime}, starting ${format(initialData.date, "MMMM do, yyyy")}, ${endText} in ${roomName}.`;
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
    return (!initialData || room.capacity >= initialData.attendees) &&
      (!initialData?.selectedEquipment.length || 
        initialData.selectedEquipment.every(eq => room.equipment.includes(eq)));
  };

  return (
    <>
      <AlertDialog open={alert} onOpenChange={setAlert}>
        <AlertDialogContent>
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden bg-white">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-xl font-semibold">
              {step === 1 ? "Set Up Recurring Booking" : "Review Recurring Booking"}
            </DialogTitle>
            {step === 1 && (
              <DialogDescription className="text-sm text-muted-foreground">
                Create multiple bookings with a repeating pattern
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="relative overflow-hidden my-2">
            <div className={cn(
              "transition-all duration-300 transform",
              step !== 1 && "absolute inset-0",
              animateTransition && (step === 1 ? "translate-x-0" : "-translate-x-full")
            )}>
              <div className="space-y-4 py-1 overflow-y-auto max-h-[60vh] px-1">
                <div className="grid grid-cols-2 gap-4 bg-accent/10 p-3 rounded-md">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Start Time</Label>
                    <Input 
                      value={initialData?.startTime || ""} 
                      readOnly 
                      className="bg-background h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">End Time</Label>
                    <Input 
                      value={initialData?.endTime || ""} 
                      readOnly 
                      className="bg-background h-8 text-sm"
                    />
                  </div>
                
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Start Date</Label>
                    <Input 
                      value={initialData ? format(initialData.date, "PPP") : ""} 
                      readOnly 
                      className="bg-background h-8 text-sm"
                    />
                  </div>
                
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Attendees</Label>
                    <Input 
                      type="number" 
                      value={initialData?.attendees || 2} 
                      readOnly 
                      className="bg-background h-8 text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Room</Label>
                  <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms
                        .filter(room => 
                          !initialData || room.capacity >= initialData.attendees
                        )
                        .map(room => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name} (Capacity: {room.capacity})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                
                {initialData?.selectedEquipment.length ? (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Required Equipment</Label>
                    <div className="flex flex-wrap gap-1">
                      {initialData.selectedEquipment.map(eq => (
                        <Badge key={eq} variant="outline" className="text-xs">
                          {eq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Recurrence Pattern</Label>
                    <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                      <SelectTrigger className="w-[140px] h-8">
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
                        className="w-16 h-8 text-sm"
                      />
                      <span className="text-sm text-muted-foreground">
                        {getFrequencyLabel()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {recurrencePattern === "weekly" && (
                  <div className="space-y-2 p-3 bg-accent/5 rounded-md">
                    <Label className="text-sm font-medium">Repeat on</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <Button
                          key={day.value}
                          type="button"
                          size="sm"
                          variant={weeklyDays.includes(day.value) ? "default" : "outline"}
                          className="w-9 h-9 rounded-full p-0"
                          onClick={() => handleWeeklyDayToggle(day.value)}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {recurrencePattern === "monthly" && (
                  <div className="space-y-2 p-3 bg-accent/5 rounded-md">
                    <Label className="text-sm font-medium">Monthly Options</Label>
                    <RadioGroup value={monthlyType} onValueChange={setMonthlyType} className="mt-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="dayOfMonth" id="dayOfMonth" />
                        <Label htmlFor="dayOfMonth" className="cursor-pointer text-sm">
                          Day {initialData?.date.getDate()} of the month
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="positionDay" id="positionDay" disabled />
                        <Label htmlFor="positionDay" className="cursor-pointer text-sm text-muted-foreground">
                          First {format(initialData?.date || new Date(), "EEEE")} of the month
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
                
                <div className="space-y-3 pt-3 border-t">
                  <Label className="text-sm font-medium">End Condition</Label>
                  <RadioGroup value={endType} onValueChange={setEndType} className="space-y-3">
                    <div className="flex items-center space-x-2 bg-accent/5 p-2 rounded-md">
                      <RadioGroupItem value="occurrences" id="occurrences" />
                      <div className="flex items-center gap-2">
                        <Label htmlFor="occurrences" className="cursor-pointer text-sm">After</Label>
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          value={occurrences}
                          onChange={(e) => setOccurrences(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 h-8 text-sm"
                          disabled={endType !== "occurrences"}
                        />
                        <span className="text-sm text-muted-foreground">occurrences</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-accent/5 p-2 rounded-md">
                      <RadioGroupItem value="endDate" id="endDate" />
                      <div className="flex items-center gap-2">
                        <Label htmlFor="endDate" className="cursor-pointer text-sm">On date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={endType !== "endDate"}
                              className={cn(
                                "justify-start text-left font-normal w-[160px] h-8 text-sm",
                                !endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                              {endDate ? format(endDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                              disabled={(date) => initialData ? isBefore(date, initialData.date) : false}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "transition-all duration-300 transform",
              step !== 2 && "absolute inset-0",
              animateTransition && (step === 2 ? "translate-x-0" : "translate-x-full")
            )}>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 py-1">
                <div className="bg-accent/20 p-3 rounded-md text-sm">
                  {getSummaryText()}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    Generated Booking Instances
                  </Label>
                  <ScrollArea className="h-[280px] rounded-md border">
                    <div className="space-y-2 p-2">
                      {bookingInstances.length > 0 ? (
                        bookingInstances.map((instance, index) => {
                          const roomForInstance = rooms.find(r => r.id === instance.roomId);
                          const originalRoomForInstance = rooms.find(r => r.id === instance.originalRoomId);
                          
                          return (
                            <div 
                              key={`${instance.date}-${index}`}
                              className={cn(
                                "p-2.5 rounded-md border flex flex-col space-y-1",
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
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {instance.startTime} - {instance.endTime}
                                  </div>
                                  {instance.status === "alternative" && (
                                    <div className="text-xs text-amber-600 mt-1 flex items-center">
                                      <ArrowRight className="h-3 w-3 mr-1" />
                                      Alternative: {roomForInstance?.name} (instead of {originalRoomForInstance?.name})
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
                                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                                      <Check className="h-3 w-3 mr-1" /> Alternative Selected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {instance.status === "conflicting" && (
                                <div className="pt-2 mt-1 border-t border-red-200">
                                  <Label className="text-xs mb-1">Select Alternative Room</Label>
                                  <Select 
                                    onValueChange={(roomId) => handleAlternativeRoomSelect(index, roomId)}
                                  >
                                    <SelectTrigger className="h-7 text-xs">
                                      <SelectValue placeholder="Choose alternative room" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          No instances generated yet. Please go back and configure the recurrence pattern.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="px-0 pt-4 border-t">
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
