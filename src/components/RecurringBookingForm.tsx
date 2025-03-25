import React, { useState } from 'react';
// Assuming Input component is available from a library like Ant Design or Material UI


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
    <form onSubmit={handleSubmit}>
      <label htmlFor="date">Date:</label>
      <Input
        type="date"
        id="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <label htmlFor="startTime">Start Time:</label>
      <Input
        type="time"
        id="startTime"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />

      <label htmlFor="attendees">Attendees:</label>
      <Input
        type="number"
        id="attendees"
        value={attendees}
        min="1"
        onChange={(e) => setAttendees(parseInt(e.target.value, 10))}
      />

      <button type="submit">Submit</button>
    </form>
  );
}

export default RecurringBookingForm;