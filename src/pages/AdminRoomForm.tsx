
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { rooms as initialRooms, Room } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

// Available equipment options
const equipmentOptions = [
  "Projector",
  "Whiteboard",
  "Video Conference",
  "Smart Board",
  "Audio System",
  "Flipcharts",
  "TV Screen",
  "HDMI Cables",
];

const AdminRoomForm = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { action, id } = useParams<{ action: string; id: string }>();
  
  const [formData, setFormData] = useState<{
    name: string;
    capacity: number;
    location: string;
    equipment: string[];
    image: string;
  }>({
    name: "",
    capacity: 0,
    location: "",
    equipment: [],
    image: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=2070&auto=format&fit=crop",
  });

  // Load room data if editing
  useEffect(() => {
    if (action === "edit" && id) {
      const roomToEdit = initialRooms.find((room) => room.id === id);
      if (roomToEdit) {
        setFormData({
          name: roomToEdit.name,
          capacity: roomToEdit.capacity,
          location: roomToEdit.location,
          equipment: roomToEdit.equipment,
          image: roomToEdit.image,
        });
      } else {
        // Room not found
        toast.error("Room not found");
        navigate("/admin/rooms");
      }
    }
  }, [action, id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "capacity" ? parseInt(value, 10) || 0 : value,
    });
  };

  const handleEquipmentChange = (item: string) => {
    setFormData((prev) => {
      const equipment = prev.equipment.includes(item)
        ? prev.equipment.filter((eq) => eq !== item)
        : [...prev.equipment, item];

      return { ...prev, equipment };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast.error("Room name is required");
      return;
    }
    
    if (formData.capacity <= 0) {
      toast.error("Capacity must be greater than 0");
      return;
    }
    
    if (!formData.location.trim()) {
      toast.error("Location is required");
      return;
    }

    // In a real app, this would be an API call
    // Here we're just showing a toast and redirecting
    const actionText = action === "edit" ? "updated" : "created";
    toast.success(`Room ${formData.name} has been ${actionText}`);
    navigate("/admin/rooms");
  };

  // Redirect to dashboard if not an admin
  if (!isAdmin) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold">Unauthorized Access</h1>
        <p className="text-muted-foreground mt-2">
          You do not have permission to access this page.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {action === "edit" ? "Edit Meeting Room" : "Add New Meeting Room"}
          </CardTitle>
          <CardDescription>
            {action === "edit"
              ? "Update the details for this meeting room"
              : "Enter the details for a new meeting room"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Conference Room A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (people)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., 1st Floor, East Wing"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Room preview"
                    className="rounded-md h-40 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Available Equipment</Label>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {equipmentOptions.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Checkbox
                      id={`equipment-${item}`}
                      checked={formData.equipment.includes(item)}
                      onCheckedChange={() => handleEquipmentChange(item)}
                    />
                    <Label htmlFor={`equipment-${item}`} className="cursor-pointer">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/rooms")}
            >
              Cancel
            </Button>
            <Button type="submit">Save Room</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminRoomForm;
