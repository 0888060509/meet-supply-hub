import { UserDTO, UserResponseDTO } from '../dto/user.dto';
import { pool } from '../database';

export class UserDLL {
  static async findByUsername(username: string): Promise<UserDTO | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  static async validateCredentials(username: string, password: string): Promise<UserResponseDTO | null> {
    const user = await this.findByUsername(username);
    if (!user || user.password !== password) {
      return null;
    }
    
    const { password: _, ...userResponse } = user;
    return userResponse;
  }
} 