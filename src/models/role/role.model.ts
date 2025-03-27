export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface RoleCreateInput {
  name: string;
  description?: string;
  permissions: string[];
}

export interface RoleUpdateInput {
  name?: string;
  description?: string;
  permissions?: string[];
} 