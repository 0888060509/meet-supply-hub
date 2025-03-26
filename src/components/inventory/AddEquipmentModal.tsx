
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Equipment {
  id: string;
  name: string;
  type: string;
  roomId: string;
  roomName: string;
  quantity: number;
  status: string;
  description: string;
}

interface Room {
  id: string;
  name: string;
}

interface AddEquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (equipmentData: any) => void;
  equipment: Equipment | null;
  rooms: Room[];
  equipmentTypes: string[];
}

const AddEquipmentModal = ({
  open,
  onOpenChange,
  onSave,
  equipment,
  rooms,
  equipmentTypes,
}: AddEquipmentModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    roomId: "",
    roomName: "",
    quantity: 1,
    status: "Available",
    description: "",
  });
  
  const [errors, setErrors] = useState({
    name: false,
    type: false,
    roomId: false,
    quantity: false,
  });

  // Load equipment data when editing
  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        type: equipment.type,
        roomId: equipment.roomId,
        roomName: equipment.roomName,
        quantity: equipment.quantity,
        status: equipment.status,
        description: equipment.description,
      });
      setErrors({
        name: false,
        type: false,
        roomId: false,
        quantity: false,
      });
    } else {
      // Reset form when adding new equipment
      setFormData({
        name: "",
        type: "",
        roomId: "",
        roomName: "",
        quantity: 1,
        status: "Available",
        description: "",
      });
    }
  }, [equipment, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is filled
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is filled
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
    
    // If selecting a room, update the roomName as well
    if (name === "roomId") {
      const selectedRoom = rooms.find(room => room.id === value);
      if (selectedRoom) {
        setFormData((prev) => ({
          ...prev,
          roomName: selectedRoom.name,
        }));
      }
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setFormData((prev) => ({
        ...prev,
        quantity: value,
      }));
      
      if (errors.quantity) {
        setErrors((prev) => ({
          ...prev,
          quantity: false,
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim(),
      type: !formData.type,
      roomId: !formData.roomId,
      quantity: formData.quantity < 1,
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {equipment ? "Edit Equipment" : "Add New Equipment"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
              Equipment Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "border-destructive" : ""}
              placeholder="Enter equipment name"
            />
            {errors.name && (
              <p className="text-xs text-destructive">Equipment name is required</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="type" className={errors.type ? "text-destructive" : ""}>
              Equipment Type *
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger 
                id="type"
                className={errors.type ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select equipment type" />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-destructive">Equipment type is required</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="roomId" className={errors.roomId ? "text-destructive" : ""}>
              Room Assigned *
            </Label>
            <Select
              value={formData.roomId}
              onValueChange={(value) => handleSelectChange("roomId", value)}
            >
              <SelectTrigger 
                id="roomId"
                className={errors.roomId ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomId && (
              <p className="text-xs text-destructive">Room assignment is required</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="quantity" className={errors.quantity ? "text-destructive" : ""}>
              Quantity *
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              value={formData.quantity}
              onChange={handleQuantityChange}
              className={errors.quantity ? "border-destructive" : ""}
            />
            {errors.quantity && (
              <p className="text-xs text-destructive">Quantity must be at least 1</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="In Use">In Use</SelectItem>
                <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add notes or details about this equipment"
              className="h-20"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {equipment ? "Save Changes" : "Add Equipment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentModal;
