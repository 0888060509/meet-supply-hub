
import React from "react";
import { Room } from "@/lib/data";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Info, ExternalLink } from "lucide-react";

interface RoomsDisplayProps {
  rooms: Room[];
  onBookNow?: (roomId: string) => void;
  readOnly?: boolean;
}

const RoomsDisplay = ({ rooms, onBookNow, readOnly = false }: RoomsDisplayProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {rooms.map((room) => (
        <Card key={room.id} className="border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{room.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1 inline" />
                    {room.location}
                  </p>
                </div>
                {!readOnly && onBookNow && (
                  <Button size="sm" onClick={() => onBookNow(room.id)}>
                    Book
                  </Button>
                )}
              </div>
              
              <div className="flex items-center mt-2">
                <Link 
                  to={`/rooms/${room.id}`}
                  className="flex items-center text-sm text-primary hover:text-primary/80"
                >
                  <Info className="h-4 w-4 mr-1" />
                  Details
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RoomsDisplay;
