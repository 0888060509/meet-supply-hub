
import { useState } from "react";
import { Room } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription  
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, MapPin, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomCardProps {
  room: Room;
  onBookNow: (roomId: string) => void;
}

const RoomCard = ({ room, onBookNow }: RoomCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <Card className="overflow-hidden hover-lift">
      <div className="relative h-48 overflow-hidden">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-accent animate-pulse" />
        )}
        <img
          src={room.image}
          alt={room.name}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-medium">{room.name}</CardTitle>
        <CardDescription className="flex items-center text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 mr-1 inline" />
          {room.location}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex items-center text-sm">
          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Capacity: {room.capacity} people</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {room.equipment.map((item, index) => (
            <Badge key={index} variant="outline" className="bg-accent/50">
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">View Details</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{room.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="rounded-md overflow-hidden">
                <img 
                  src={room.image} 
                  alt={room.name} 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{room.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Capacity: {room.capacity} people</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center">
                    <Monitor className="h-4 w-4 mr-2 text-muted-foreground" />
                    Equipment
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {room.equipment.map((item, index) => (
                      <Badge key={index} variant="outline" className="bg-accent/50">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={() => onBookNow(room.id)}>Book Now</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button onClick={() => onBookNow(room.id)}>Book Now</Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
