// User model
export interface User {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  role: 'employee' | 'admin';
}

// Equipment Type model
export interface EquipmentType {
  id: string;
  name: string;
}

// Room Equipment model
export interface RoomEquipment {
  roomId: string;
  equipmentTypeId: string;
  quantity: number;
  equipmentName?: string; // For joined queries
}

// Room model
export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  image?: string;
  equipment?: RoomEquipment[]; // For joined queries
}

// Booking model
export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  title: string;
  createdAt: Date;
}

// Supply model
export interface Supply {
  id: string;
  name: string;
  category: string;
  inStock: number;
  image?: string;
}

// Request model
export interface Request {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'ready' | 'rejected';
  requestDate: Date;
  items: RequestItem[];
}

// Request Item model
export interface RequestItem {
  requestId: string;
  supplyId: string;
  quantity: number;
} 