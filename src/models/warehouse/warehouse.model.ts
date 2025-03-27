export interface Warehouse {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface WarehouseCreateInput {
  name: string;
  address: string;
  phone: string;
  email: string;
  manager_id: string;
  status?: 'active' | 'inactive';
}

export interface WarehouseUpdateInput {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  manager_id?: string;
  status?: 'active' | 'inactive';
} 