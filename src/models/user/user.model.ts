import { RoleId } from '@/types/role';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  roles: RoleId[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  last_login?: string;
  login_count?: number;
}

export interface UserCreateInput {
  username: string;
  name: string;
  email: string;
  password: string;
  roles: RoleId[];
  status?: 'active' | 'inactive';
}

export interface UserUpdateInput {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  roles?: RoleId[];
  status?: 'active' | 'inactive';
} 