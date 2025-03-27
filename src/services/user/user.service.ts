import { User, UserCreateInput, UserUpdateInput } from '@/models/user/user.model';
import { UserRepository } from '@/repositories/user/user.repository';
import { RoleId } from '@/types/role';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async create(data: UserCreateInput): Promise<User> {
    // Check if username or email already exists
    const existingUsername = await this.findByUsername(data.username);
    const existingEmail = await this.findByEmail(data.email);

    if (existingUsername) {
      throw new Error('Username already exists');
    }

    if (existingEmail) {
      throw new Error('Email already exists');
    }

    return this.userRepository.create(data);
  }

  async update(id: string, data: UserUpdateInput): Promise<User> {
    // Check if email is being changed and if it already exists
    if (data.email) {
      const existingEmail = await this.findByEmail(data.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new Error('Email already exists');
      }
    }

    return this.userRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }

  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<User> {
    return this.userRepository.updateStatus(id, status);
  }

  async updateLastLogin(id: string): Promise<User> {
    return this.userRepository.updateLastLogin(id);
  }

  async findByRole(roleId: RoleId): Promise<User[]> {
    return this.userRepository.findByRole(roleId);
  }
} 