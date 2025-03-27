
import { useState } from "react";
import { Room } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription  
} from "@/components/ui/card";
import { Users, MapPin, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomCardProps {
  room: Room;
}

const RoomCard = ({ room }: RoomCardProps) => {
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
      
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="flex items-center text-sm">
          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Capacity: {room.capacity} people</span>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Available Equipment:</h4>
          <div className="flex flex-wrap gap-1.5">
            {room.equipment.map((item, index) => (
              <Badge key={index} variant="outline" className="bg-primary/10 text-primary/90">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
