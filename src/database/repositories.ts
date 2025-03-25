import { query, transaction } from './database';
import { User, Room, Booking, Supply, Request, RequestItem, EquipmentType, RoomEquipment } from './models';
import crypto from 'crypto';

const SALT = 'henry@cuong';

function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password + SALT).digest('hex');
}

// User Repository
export const UserRepository = {
  async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result[0] || null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result[0] || null;
  },

  async create(user: Omit<User, 'id' | 'password_hash'> & { password: string }): Promise<User> {
    const result = await query(
      'INSERT INTO users (username, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.username, hashPassword(user.password), user.name, user.role]
    );
    return result[0];
  },

  async verifyPassword(username: string, password: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    if (!user) return false;
    return user.password_hash === hashPassword(password);
  },

  async login(username: string, password: string) {
    const user = await query(
      `
      SELECT * FROM users 
      WHERE username = $1 
      AND password = crypt($2, password)
      AND status = 'active'
      `,
      [username, password]
    );

    if (!user[0]) {
      return null;
    }

    // Update last_login and login_count
    await query(
      `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP,
          login_count = COALESCE(login_count, 0) + 1
      WHERE id = $1
      `,
      [user[0].id]
    );

    // Fetch updated user data
    return query(
      `SELECT * FROM users WHERE id = $1`,
      [user[0].id]
    );
  },

  async updateStatus(id: string, status: 'active' | 'inactive') {
    const result = await query('UPDATE users SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    return result[0] || null;
  }
};

// Equipment Type Repository
export const EquipmentTypeRepository = {
  async findAll(): Promise<EquipmentType[]> {
    return await query('SELECT * FROM equipment_types ORDER BY name');
  },

  async findById(id: string): Promise<EquipmentType | null> {
    const result = await query('SELECT * FROM equipment_types WHERE id = $1', [id]);
    return result[0] || null;
  },

  async create(equipmentType: Omit<EquipmentType, 'id'>): Promise<EquipmentType> {
    const result = await query(
      'INSERT INTO equipment_types (name) VALUES ($1) RETURNING *',
      [equipmentType.name]
    );
    return result[0];
  }
};

// Room Repository
export const RoomRepository = {
  async findAll(): Promise<Room[]> {
    const rooms = await query('SELECT * FROM rooms');
    return Promise.all(rooms.map(async (room) => {
      const equipment = await query(
        `SELECT re.*, et.name as equipment_name 
         FROM room_equipment re 
         JOIN equipment_types et ON et.id = re.equipment_type_id 
         WHERE re.room_id = $1`,
        [room.id]
      );
      return { ...room, equipment };
    }));
  },

  async findById(id: string): Promise<Room | null> {
    const result = await query('SELECT * FROM rooms WHERE id = $1', [id]);
    if (!result[0]) return null;

    const equipment = await query(
      `SELECT re.*, et.name as equipment_name 
       FROM room_equipment re 
       JOIN equipment_types et ON et.id = re.equipment_type_id 
       WHERE re.room_id = $1`,
      [id]
    );
    return { ...result[0], equipment };
  },

  async create(room: Omit<Room, 'id'>, equipment: { equipmentTypeId: string; quantity: number }[]): Promise<Room> {
    return await transaction(async (client) => {
      // Create room
      const roomResult = await client.query(
        'INSERT INTO rooms (name, capacity, location, image) VALUES ($1, $2, $3, $4) RETURNING *',
        [room.name, room.capacity, room.location, room.image]
      );
      const newRoom = roomResult.rows[0];

      // Add equipment
      for (const item of equipment) {
        await client.query(
          'INSERT INTO room_equipment (room_id, equipment_type_id, quantity) VALUES ($1, $2, $3)',
          [newRoom.id, item.equipmentTypeId, item.quantity]
        );
      }

      // Get complete room data with equipment
      const equipmentResult = await client.query(
        `SELECT re.*, et.name as equipment_name 
         FROM room_equipment re 
         JOIN equipment_types et ON et.id = re.equipment_type_id 
         WHERE re.room_id = $1`,
        [newRoom.id]
      );
      return { ...newRoom, equipment: equipmentResult.rows };
    });
  },

  async update(id: string, room: Partial<Room>, equipment?: { equipmentTypeId: string; quantity: number }[]): Promise<Room | null> {
    return await transaction(async (client) => {
      const current = await this.findById(id);
      if (!current) return null;

      // Update room
      const roomResult = await client.query(
        'UPDATE rooms SET name = $1, capacity = $2, location = $3, image = $4 WHERE id = $5 RETURNING *',
        [
          room.name || current.name,
          room.capacity || current.capacity,
          room.location || current.location,
          room.image || current.image,
          id
        ]
      );

      // Update equipment if provided
      if (equipment) {
        // Remove existing equipment
        await client.query('DELETE FROM room_equipment WHERE room_id = $1', [id]);
        
        // Add new equipment
        for (const item of equipment) {
          await client.query(
            'INSERT INTO room_equipment (room_id, equipment_type_id, quantity) VALUES ($1, $2, $3)',
            [id, item.equipmentTypeId, item.quantity]
          );
        }
      }

      // Get complete room data with equipment
      const equipmentResult = await client.query(
        `SELECT re.*, et.name as equipment_name 
         FROM room_equipment re 
         JOIN equipment_types et ON et.id = re.equipment_type_id 
         WHERE re.room_id = $1`,
        [id]
      );
      return { ...roomResult.rows[0], equipment: equipmentResult.rows };
    });
  }
};

// Booking Repository
export const BookingRepository = {
  async findByRoom(roomId: string): Promise<Booking[]> {
    return await query('SELECT * FROM bookings WHERE room_id = $1', [roomId]);
  },

  async create(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const result = await query(
      'INSERT INTO bookings (room_id, user_id, date, start_time, end_time, title) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [booking.roomId, booking.userId, booking.date, booking.startTime, booking.endTime, booking.title]
    );
    return result[0];
  },

  async findConflictingBookings(roomId: string, date: Date, startTime: string, endTime: string): Promise<Booking[]> {
    return await query(
      `SELECT * FROM bookings 
       WHERE room_id = $1 
       AND date = $2 
       AND ((start_time <= $3 AND end_time > $3) 
         OR (start_time < $4 AND end_time >= $4)
         OR (start_time >= $3 AND end_time <= $4))`,
      [roomId, date, startTime, endTime]
    );
  }
};

// Supply Repository
export const SupplyRepository = {
  async findAll(): Promise<Supply[]> {
    return await query('SELECT * FROM supplies');
  },

  async findById(id: string): Promise<Supply | null> {
    const result = await query('SELECT * FROM supplies WHERE id = $1', [id]);
    return result[0] || null;
  },

  async create(supply: Omit<Supply, 'id'>): Promise<Supply> {
    const result = await query(
      'INSERT INTO supplies (name, category, in_stock, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [supply.name, supply.category, supply.inStock, supply.image]
    );
    return result[0];
  },

  async updateStock(id: string, quantity: number): Promise<Supply | null> {
    const result = await query(
      'UPDATE supplies SET in_stock = in_stock + $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    return result[0] || null;
  }
};

// Request Repository
export const RequestRepository = {
  async create(request: Omit<Request, 'id' | 'requestDate'>): Promise<Request> {
    return await transaction(async (client) => {
      // Create request
      const requestResult = await client.query(
        'INSERT INTO requests (user_id, status) VALUES ($1, $2) RETURNING *',
        [request.userId, request.status]
      );
      const newRequest = requestResult.rows[0];

      // Create request items
      for (const item of request.items) {
        await client.query(
          'INSERT INTO request_items (request_id, supply_id, quantity) VALUES ($1, $2, $3)',
          [newRequest.id, item.supplyId, item.quantity]
        );
      }

      // Return complete request with items
      const items = await client.query(
        'SELECT * FROM request_items WHERE request_id = $1',
        [newRequest.id]
      );
      return { ...newRequest, items: items.rows };
    });
  },

  async findById(id: string): Promise<Request | null> {
    const request = await query('SELECT * FROM requests WHERE id = $1', [id]);
    if (!request[0]) return null;

    const items = await query('SELECT * FROM request_items WHERE request_id = $1', [id]);
    return { ...request[0], items };
  },

  async updateStatus(id: string, status: Request['status']): Promise<Request | null> {
    const result = await query(
      'UPDATE requests SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (!result[0]) return null;

    const items = await query('SELECT * FROM request_items WHERE request_id = $1', [id]);
    return { ...result[0], items };
  },

  async findByUser(userId: string): Promise<Request[]> {
    const requests = await query('SELECT * FROM requests WHERE user_id = $1', [userId]);
    const requestsWithItems = await Promise.all(
      requests.map(async (request) => {
        const items = await query('SELECT * FROM request_items WHERE request_id = $1', [request.id]);
        return { ...request, items };
      })
    );
    return requestsWithItems;
  }
}; 