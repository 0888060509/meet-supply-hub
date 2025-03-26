
export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
  status?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  equipment: string[];
}

export const rooms: Room[] = [
  {
    id: "room1",
    name: "Conference Room A",
    capacity: 20,
    location: "1st Floor, East Wing",
    equipment: ["Projector", "Whiteboard", "Video Conference System"],
    status: "Available"
  },
  {
    id: "room2",
    name: "Meeting Room B",
    capacity: 8,
    location: "2nd Floor, West Wing",
    equipment: ["Whiteboard", "TV Screen"],
    status: "Available"
  },
  {
    id: "room3",
    name: "Board Room",
    capacity: 12,
    location: "3rd Floor, Executive Suite",
    equipment: ["Projector", "Whiteboard", "Video Conference System", "Flipchart"],
    status: "Under Maintenance"
  },
  {
    id: "room4",
    name: "Huddle Space",
    capacity: 4,
    location: "1st Floor, North Wing",
    equipment: ["Whiteboard"],
    status: "Available"
  }
];

export const bookings: Booking[] = [
  {
    id: "booking1",
    roomId: "room1",
    userId: "user1",
    title: "Project Kickoff",
    date: "2024-08-15",
    startTime: "09:00",
    endTime: "11:00",
    attendees: 15,
    equipment: ["Projector", "Whiteboard"]
  },
  {
    id: "booking2",
    roomId: "room2",
    userId: "user1",
    title: "Team Meeting",
    date: "2024-08-16",
    startTime: "14:00",
    endTime: "15:00",
    attendees: 6,
    equipment: ["Whiteboard"]
  },
  {
    id: "booking3",
    roomId: "room1",
    userId: "user2",
    title: "Client Presentation",
    date: "2024-08-17",
    startTime: "10:00",
    endTime: "12:00",
    attendees: 10,
    equipment: ["Projector", "Video Conference System"]
  },
  {
    id: "booking4",
    roomId: "room3",
    userId: "user1",
    title: "Executive Strategy Session",
    date: "2024-08-18",
    startTime: "13:00",
    endTime: "16:00",
    attendees: 8,
    equipment: ["Projector", "Whiteboard", "Flipchart"]
  },
  {
    id: "booking5",
    roomId: "room2",
    userId: "user2",
    title: "Product Demo",
    date: "2024-08-19",
    startTime: "11:00",
    endTime: "12:00",
    attendees: 4,
    equipment: ["TV Screen"]
  },
  {
    id: "booking6",
    roomId: "room4",
    userId: "user1",
    title: "Quick Sync",
    date: "2024-08-20",
    startTime: "16:00",
    endTime: "17:00",
    attendees: 2,
    equipment: []
  },
  {
    id: "booking7",
    roomId: "room1",
    userId: "user3",
    title: "Workshop",
    date: "2024-08-21",
    startTime: "09:00",
    endTime: "17:00",
    attendees: 18,
    equipment: ["Projector", "Whiteboard", "Video Conference System"]
  },
  {
    id: "booking8",
    roomId: "room2",
    userId: "user3",
    title: "Training Session",
    date: "2024-08-22",
    startTime: "13:00",
    endTime: "15:00",
    attendees: 7,
    equipment: ["Whiteboard"]
  }
];

export interface Supply {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  inStock?: number;
  image?: string;
}

export const supplies: Supply[] = [
  {
    id: "supply1",
    name: "Staples",
    category: "Office Supplies",
    quantity: 5000,
    unitCost: 0.01,
    inStock: 5000
  },
  {
    id: "supply2",
    name: "Printer Paper",
    category: "Office Supplies",
    quantity: 2000,
    unitCost: 0.05,
    inStock: 2000
  },
  {
    id: "supply3",
    name: "Pens",
    category: "Office Supplies",
    quantity: 1000,
    unitCost: 0.25,
    inStock: 1000
  },
  {
    id: "supply4",
    name: "Cleaning Wipes",
    category: "Janitorial",
    quantity: 500,
    unitCost: 1.50,
    inStock: 500
  },
  {
    id: "supply5",
    name: "Hand Soap",
    category: "Janitorial",
    quantity: 200,
    unitCost: 2.00,
    inStock: 200
  }
];

// Define the Request interface that's imported in Supplies.tsx
export interface Request {
  id: string;
  userId: string;
  items: Array<{
    supplyId: string;
    quantity: number;
  }>;
  requestDate: string;
  status: string;
  notes?: string;
}

// Sample requests data
export const requests: Request[] = [
  {
    id: "request1",
    userId: "user1",
    items: [
      { supplyId: "supply1", quantity: 100 },
      { supplyId: "supply3", quantity: 5 }
    ],
    requestDate: "2024-08-15",
    status: "pending",
    notes: "Need for the new project"
  },
  {
    id: "request2",
    userId: "user2",
    items: [
      { supplyId: "supply2", quantity: 50 }
    ],
    requestDate: "2024-08-16",
    status: "approved",
    notes: "Monthly refill"
  }
];

// Helper function to get bookings for a specific user
export const getUserBookings = (userId: string): Booking[] => {
  return bookings.filter(booking => booking.userId === userId);
};

// Helper function to get requests for a specific user
export const getUserRequests = (userId: string): Request[] => {
  return requests.filter(request => request.userId === userId);
};
