export type UserRole = "employee" | "admin";

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