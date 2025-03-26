
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function RecurringBookingForm() {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [attendees, setAttendees] = useState(1);


  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Date:", date);
    console.log("Start Time:", startTime);
    console.log("Attendees:", attendees);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="date" className="text-sm font-medium">Date:</label>
        <Input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="startTime" className="text-sm font-medium">Start Time:</label>
        <Input
          type="time"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="attendees" className="text-sm font-medium">Attendees:</label>
        <Input
          type="number"
          id="attendees"
          value={attendees}
          min="1"
          onChange={(e) => setAttendees(parseInt(e.target.value, 10))}
        />
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
}

export default RecurringBookingForm;
