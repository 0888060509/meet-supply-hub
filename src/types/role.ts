export enum RoleId {
  Admin = 'admin',
  Employee = 'employee'
}

export interface Role {
  id: RoleId;
  name: string;
  description?: string;
  permissions: string[];
} 