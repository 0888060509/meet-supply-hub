
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Room } from "@/lib/data";

// Equipment options for the checkbox group
const EQUIPMENT_OPTIONS = [
  { id: "projector", label: "Projector" },
  { id: "whiteboard", label: "Whiteboard" },
  { id: "videoConference", label: "Video Conference System" },
  { id: "tv", label: "TV Screen" },
  { id: "flipchart", label: "Flipchart" },
];

// Status options for the select dropdown
const STATUS_OPTIONS = [
  { value: "Available", label: "Available" },
  { value: "Under Maintenance", label: "Under Maintenance" },
  { value: "Reserved", label: "Reserved" },
];

// Form schema using Zod
const formSchema = z.object({
  name: z.string().min(1, { message: "Room name is required" }),
  capacity: z.string().min(1, { message: "Capacity is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Capacity must be a positive number",
    }),
  location: z.string().min(1, { message: "Location is required" }),
  equipment: z.array(z.string()),
  status: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RoomFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (room: Room) => void;
  title: string;
  room?: Room | null;
}

const RoomFormModal = ({
  open,
  onOpenChange,
  onSubmit,
  title,
  room = null,
}: RoomFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      capacity: "",
      location: "",
      equipment: [],
      status: "Available",
    },
  });

  // Reset the form when the modal opens/closes or when the room prop changes
  useEffect(() => {
    if (open && room) {
      form.reset({
        name: room.name,
        capacity: room.capacity.toString(),
        location: room.location,
        equipment: room.equipment,
        status: room.status || "Available",
      });
    } else if (!open) {
      form.reset({
        name: "",
        capacity: "",
        location: "",
        equipment: [],
        status: "Available",
      });
    }
  }, [open, room, form]);

  const handleSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    
    const roomData: Room = {
      id: room?.id || "",
      name: values.name,
      capacity: parseInt(values.capacity),
      location: values.location,
      equipment: values.equipment,
      status: values.status || "Available",
    };
    
    // Simulate API delay
    setTimeout(() => {
      onSubmit(roomData);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {room ? "Edit room details below." : "Add a new meeting room to your workspace."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter room name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Number of people"
                        min="1" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Floor/Building/Area" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="equipment"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Equipment</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {EQUIPMENT_OPTIONS.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="equipment"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.label)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, option.label])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== option.label
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : room ? "Update Room" : "Add Room"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomFormModal;
