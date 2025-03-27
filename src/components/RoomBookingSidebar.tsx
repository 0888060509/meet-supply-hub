
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rooms, bookings } from "@/lib/data";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  MapPin, 
  Users, 
  Projector, 
  MonitorCheck, 
  Wifi, 
  Tv, 
  Presentation, 
  Mic2, 
  StickyNote,
  ArrowRight
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Equipment icon mapping
const equipmentIcons: Record<string, React.ReactNode> = {
  "Projector": <Projector className="h-4 w-4" />,
  "Whiteboard": <StickyNote className="h-4 w-4" />,
  "Video Conference": <Tv className="h-4 w-4" />,
  "Teleconference": <Mic2 className="h-4 w-4" />,
  "Display Screen": <MonitorCheck className="h-4 w-4" />,
  "WiFi": <Wifi className="h-4 w-4" />,
  "Presentation Setup": <Presentation className="h-4 w-4" />
};

const RoomBookingSidebar = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedDate] = useState<Date>(new Date());
  
  // Find the current room based on the URL parameter
  const room = rooms.find(r => r.id === id);
  
  // If room not found, return null
  if (!room) {
    return null;
  }
  
  // Filter bookings for this room on the selected date
  const roomBookings = bookings.filter(
    b => b.roomId === room.id && b.date === format(selectedDate, "yyyy-MM-dd")
  ).sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Check if the room is currently available
  const currentTime = format(new Date(), "HH:mm");
  const isRoomCurrentlyAvailable = !roomBookings.some(
    b => b.startTime <= currentTime && b.endTime > currentTime
  );

  // Get next booking information if available
  const nextBooking = roomBookings.find(
    b => b.startTime > currentTime
  );
  
  const handleBookNow = () => {
    navigate(`/rooms/${room.id}`);
  };
  
  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 shadow-md border-primary/10 flex flex-col">
        <CardHeader className="pb-0 pt-3 px-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold">{room.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {room.location}
              </div>
            </div>
            <Badge 
              variant={isRoomCurrentlyAvailable ? "outline" : "secondary"}
              className={`
                ${isRoomCurrentlyAvailable 
                  ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' 
                  : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'}
              `}
            >
              {isRoomCurrentlyAvailable ? 'Available Now' : 'In Use'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2 overflow-y-auto flex-grow">
          <div className="space-y-4">
            {/* Room Details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{room.capacity} people</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">8:00 AM - 6:00 PM</span>
              </div>
            </div>
            
            {/* Equipment Icons */}
            <div>
              <p className="text-sm font-medium mb-2">Equipment</p>
              <div className="flex flex-wrap gap-2">
                {room.equipment.map(item => (
                  <Badge 
                    key={item}
                    variant="outline" 
                    className="flex items-center gap-1 bg-accent/50 hover:bg-accent"
                  >
                    {equipmentIcons[item] || <StickyNote className="h-3.5 w-3.5" />}
                    <span>{item}</span>
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Today's Schedule */}
            <div>
              <p className="text-sm font-medium mb-2">Today's Schedule</p>
              {roomBookings.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-accent/50">
                      <TableRow>
                        <TableHead className="w-1/3">Time</TableHead>
                        <TableHead>Meeting</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roomBookings.map((booking) => (
                        <TableRow 
                          key={booking.id}
                          className={`
                            ${booking.startTime <= currentTime && booking.endTime > currentTime
                              ? 'bg-red-50' 
                              : 'bg-white'}
                          `}
                        >
                          <TableCell className="font-medium">
                            {booking.startTime} - {booking.endTime}
                          </TableCell>
                          <TableCell>{booking.title}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 border rounded-md bg-accent/10">
                  <Calendar className="h-8 w-8 mx-auto text-primary/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No bookings today</p>
                </div>
              )}
            </div>
            
            {/* Next Available */}
            {!isRoomCurrentlyAvailable && nextBooking && (
              <div className="rounded-md border p-3 bg-amber-50">
                <p className="text-sm font-medium text-amber-800 mb-1">Next Available</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">{nextBooking.endTime} today</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 gap-1 border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800"
                    onClick={handleBookNow}
                  >
                    Book After
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handleBookNow}
          >
            Book This Room
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RoomBookingSidebar;
