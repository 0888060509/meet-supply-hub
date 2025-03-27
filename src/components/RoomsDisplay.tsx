
import React from "react";
import { Room } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Monitor } from "lucide-react";

interface RoomsDisplayProps {
  rooms: Room[];
  readOnly?: boolean;
}

const RoomsDisplay = ({ rooms, readOnly = true }: RoomsDisplayProps) => {
  // Define common scenarios based on room equipment and capacity
  const getScenarios = (room: Room): string[] => {
    const scenarios = [];
    
    if (room.equipment.includes("Video Conference System")) {
      scenarios.push("Remote Meetings");
    }
    
    if (room.equipment.includes("Projector")) {
      scenarios.push("Presentations");
    }
    
    if (room.capacity >= 10) {
      scenarios.push("Team Workshops");
    }
    
    if (room.capacity <= 4) {
      scenarios.push("Quick Syncs");
    }
    
    if (room.equipment.includes("Whiteboard")) {
      scenarios.push("Brainstorming");
    }
    
    // Add a default scenario if none match
    if (scenarios.length === 0) {
      scenarios.push("General Meetings");
    }
    
    return scenarios;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => {
        const scenarios = getScenarios(room);
        
        return (
          <Card key={room.id} className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {room.image && (
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={room.image} 
                  alt={room.name} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
            )}
            
            <CardContent className="p-5">
              <div className="flex flex-col space-y-3">
                <div>
                  <h3 className="font-medium text-lg">{room.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1 inline" />
                    {room.location}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Capacity: {room.capacity} people</span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Perfect for:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {scenarios.map((scenario, index) => (
                      <Badge key={index} variant="outline" className="bg-accent/40">
                        {scenario}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {room.equipment.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Monitor className="h-3.5 w-3.5 mr-1" />
                      Available Equipment:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {room.equipment.map((item, index) => (
                        <Badge key={index} variant="outline" className="bg-primary/10 text-primary/90">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RoomsDisplay;
