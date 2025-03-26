export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
  status?: string;
  image?: string;
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
    status: "Available",
    image: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "room2",
    name: "Meeting Room B",
    capacity: 8,
    location: "2nd Floor, West Wing",
    equipment: ["Whiteboard", "TV Screen"],
    status: "Available",
    image: "https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "room3",
    name: "Board Room",
    capacity: 12,
    location: "3rd Floor, Executive Suite",
    equipment: ["Projector", "Whiteboard", "Video Conference System", "Flipchart"],
    status: "Under Maintenance",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop"
  },
  {
    id: "room4",
    name: "Huddle Space",
    capacity: 4,
    location: "1st Floor, North Wing",
    equipment: ["Whiteboard"],
    status: "Available",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop"
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
  description?: string;
  link?: string;
}

export const supplies: Supply[] = [
  {
    id: "supply1",
    name: "Staples",
    category: "Office Supplies",
    quantity: 5000,
    unitCost: 0.01,
    inStock: 5000,
    description: "Standard staples for office staplers"
  },
  {
    id: "supply2",
    name: "Printer Paper",
    category: "Office Supplies",
    quantity: 2000,
    unitCost: 0.05,
    inStock: 2000,
    description: "Standard A4 printer paper"
  },
  {
    id: "supply3",
    name: "Pens",
    category: "Office Supplies",
    quantity: 1000,
    unitCost: 0.25,
    inStock: 1000,
    description: "Blue ballpoint pens"
  },
  {
    id: "supply4",
    name: "Cleaning Wipes",
    category: "Janitorial",
    quantity: 500,
    unitCost: 1.50,
    inStock: 500,
    description: "Antibacterial surface cleaning wipes"
  },
  {
    id: "supply5",
    name: "Hand Soap",
    category: "Janitorial",
    quantity: 200,
    unitCost: 2.00,
    inStock: 200,
    description: "Liquid hand soap for bathrooms"
  }
];

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

export const getUserBookings = (userId: string): Booking[] => {
  return bookings.filter(booking => booking.userId === userId);
};

export const getUserRequests = (userId: string): Request[] => {
  return requests.filter(request => request.userId === userId);
};
