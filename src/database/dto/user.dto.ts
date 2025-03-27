export type UserRole = "employee" | "admin";

export interface CreateUserDto {
  username: string;
  password: string;
  name: string;
  email: string;
  roles: UserRole[];
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  name?: string;
  email?: string;
  roles?: UserRole[];
  status?: 'active' | 'inactive';
}

export interface UserDTO {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password: string;
}

export interface UserResponseDTO {
  id: string;
  username: string;
  name: string;
  role: UserRole;
} 