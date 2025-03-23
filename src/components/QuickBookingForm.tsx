
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { rooms } from "@/lib/data";
import { format } from "date-fns";

export function QuickBookingForm() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !roomId || !date || !startTime || !endTime) {
      toast({
        title: "Missing fields",
        description: "Please fill out all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Check if start time is before end time
    if (startTime >= endTime) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }
    
    // Here we would call an API to save the booking
    // For now we'll just show a success toast
    toast({
      title: "Room booked successfully",
      description: `You booked ${rooms.find(r => r.id === roomId)?.name} for ${date} from ${startTime} to ${endTime}`,
    });
    
    // Close the dialog (this will be handled by the DialogClose component)
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Meeting Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Team Standup"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="room">Room</Label>
          <Select value={roomId} onValueChange={setRoomId}>
            <SelectTrigger id="room">
              <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name} ({room.capacity} people)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={format(new Date(), "yyyy-MM-dd")}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="submit" onClick={handleSubmit}>Book Room</Button>
        </DialogClose>
      </DialogFooter>
    </form>
  );
}
