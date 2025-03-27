import { User, UserCreateInput, UserUpdateInput } from '@/models/user/user.model';
import { RoleId } from '@/types/role';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: UserCreateInput): Promise<User>;
  update(id: string, data: UserUpdateInput): Promise<User>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: 'active' | 'inactive'): Promise<User>;
  updateLastLogin(id: string): Promise<User>;
  findByRole(roleId: RoleId): Promise<User[]>;
} 