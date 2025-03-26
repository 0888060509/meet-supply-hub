export type Room = {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
  image: string;
};

export type Booking = {
  id: string;
  roomId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
};

export type Supply = {
  id: string;
  name: string;
  category: string;
  inStock: number;
  image: string;
  description?: string;
};

export type Request = {
  id: string;
  userId: string;
  items: { supplyId: string; quantity: number }[];
  status: 'pending' | 'approved' | 'ready' | 'rejected';
  requestDate: string;
};

// Mock data for rooms
export const rooms: Room[] = [
  {
    id: "room1",
    name: "Conference Room A",
    capacity: 12,
    location: "1st Floor, East Wing",
    equipment: ["Projector", "Whiteboard", "Video Conference"],
    image: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "room2",
    name: "Meeting Room B",
    capacity: 6,
    location: "2nd Floor, West Wing",
    equipment: ["Whiteboard", "Video Conference"],
    image: "https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "room3",
    name: "Brainstorm Room",
    capacity: 8,
    location: "3rd Floor, North Wing",
    equipment: ["Smart Board", "Video Conference", "Flipcharts"],
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop"
  },
  {
    id: "room4",
    name: "Board Room",
    capacity: 20,
    location: "4th Floor, Executive Suite",
    equipment: ["Projector", "Video Conference", "Audio System"],
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=2025&auto=format&fit=crop"
  }
];

// Mock data for bookings
export const bookings: Booking[] = [
  {
    id: "booking1",
    roomId: "room1",
    userId: "user1",
    date: "2023-10-15",
    startTime: "09:00",
    endTime: "10:30",
    title: "Project Kickoff"
  },
  {
    id: "booking2",
    roomId: "room2",
    userId: "user2",
    date: "2023-10-15",
    startTime: "11:00",
    endTime: "12:00",
    title: "Team Sync"
  },
  {
    id: "booking3",
    roomId: "room3",
    userId: "user1",
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: "14:00",
    endTime: "15:00",
    title: "Sprint Planning"
  },
  {
    id: "booking4",
    roomId: "room4",
    userId: "user1",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: "10:00",
    endTime: "11:30",
    title: "Client Presentation"
  },
  {
    id: "booking5",
    roomId: "room2",
    userId: "user1",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: "13:00",
    endTime: "14:00",
    title: "Team Retrospective"
  },
  {
    id: "booking6",
    roomId: "room1",
    userId: "user1",
    date: new Date().toISOString().split('T')[0],
    startTime: new Date(new Date().getTime() + 20 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    endTime: new Date(new Date().getTime() + 80 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    title: "Urgent Meeting"
  }
];

// Mock data for supplies
export const supplies: Supply[] = [
  {
    id: "supply1",
    name: "Ballpoint Pen",
    category: "Writing",
    inStock: 120,
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=2122&auto=format&fit=crop",
    description: "Standard blue ballpoint pen, medium point."
  },
  {
    id: "supply2",
    name: "Notebook (A5)",
    category: "Paper",
    inStock: 45,
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=2187&auto=format&fit=crop",
    description: "A5 size, ruled notebook with 80 pages."
  },
  {
    id: "supply3",
    name: "Stapler",
    category: "Tools",
    inStock: 18,
    image: "https://images.unsplash.com/photo-1612143760124-9f8e25d7c1c4?q=80&w=2130&auto=format&fit=crop",
    description: "Desktop stapler, black, holds standard staples."
  },
  {
    id: "supply4",
    name: "Sticky Notes",
    category: "Paper",
    inStock: 75,
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=2122&auto=format&fit=crop",
    description: "3x3 inch yellow sticky notes, pack of 100."
  },
  {
    id: "supply5",
    name: "Highlighter",
    category: "Writing",
    inStock: 50,
    image: "https://images.unsplash.com/photo-1611532736597-8bc2eb1ecf91?q=80&w=2187&auto=format&fit=crop",
    description: "Fluorescent yellow highlighter pen, chisel tip."
  }
];

// Mock data for requests
export const requests: Request[] = [
  {
    id: "request1",
    userId: "user1",
    items: [
      { supplyId: "supply1", quantity: 3 },
      { supplyId: "supply2", quantity: 1 }
    ],
    status: "pending",
    requestDate: "2023-10-12"
  },
  {
    id: "request2",
    userId: "user2",
    items: [
      { supplyId: "supply3", quantity: 1 }
    ],
    status: "approved",
    requestDate: "2023-10-10"
  },
  {
    id: "request3",
    userId: "user1",
    items: [
      { supplyId: "supply4", quantity: 5 },
      { supplyId: "supply5", quantity: 2 }
    ],
    status: "pending",
    requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: "request4",
    userId: "user1",
    items: [
      { supplyId: "supply1", quantity: 10 }
    ],
    status: "approved",
    requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: "request5",
    userId: "user1",
    items: [
      { supplyId: "supply3", quantity: 1 },
      { supplyId: "supply2", quantity: 3 }
    ],
    status: "ready",
    requestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: "request6",
    userId: "user1",
    items: [
      { supplyId: "supply5", quantity: 2 }
    ],
    status: "rejected",
    requestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

// Helper function to get user's bookings
export const getUserBookings = (userId: string): Booking[] => {
  return bookings.filter(booking => booking.userId === userId);
};

// Helper function to get user's supply requests
export const getUserRequests = (userId: string): Request[] => {
  return requests.filter(request => request.userId === userId);
};

// Mock current user
export const currentUser = {
  id: "user1",
  name: "Jane Doe",
  role: "Employee" // or "Manager"
};
