
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Users, CheckSquare } from "lucide-react";
import { Room } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(3, { message: "Meeting title must be at least 3 characters." }),
  date: z.date({ required_error: "Please select a date." }),
  attendees: z.string().transform(val => parseInt(val)),
  equipment: z.array(z.string()).optional(),
});

type BookingFormData = z.infer<typeof formSchema>;

interface RoomBookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  allEquipment: string[];
}

const RoomBookingForm = ({ onSubmit, allEquipment }: RoomBookingFormProps) => {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      attendees: "2",
      equipment: [],
    },
  });

  const handleSubmit = (data: BookingFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter meeting title or purpose" {...field} />
              </FormControl>
              <FormDescription>
                A brief description of your meeting.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Meeting Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => 
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the date for your meeting.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attendees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Attendees</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of attendees" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="2">2 people</SelectItem>
                  <SelectItem value="4">4 people</SelectItem>
                  <SelectItem value="6">6 people</SelectItem>
                  <SelectItem value="8">8 people</SelectItem>
                  <SelectItem value="10">10 people</SelectItem>
                  <SelectItem value="12">12+ people</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How many people will attend this meeting?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipment"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Required Equipment</FormLabel>
                <FormDescription>
                  Select any equipment you'll need for your meeting.
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {allEquipment.map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="equipment"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value || [], item])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Find Available Rooms</Button>
      </form>
    </Form>
  );
};

export default RoomBookingForm;
