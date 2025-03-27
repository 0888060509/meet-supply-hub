export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  unit: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface ProductCreateInput {
  name: string;
  description?: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  unit: string;
  status?: 'active' | 'inactive';
}

export interface ProductUpdateInput {
  name?: string;
  description?: string;
  sku?: string;
  category?: string;
  price?: number;
  cost?: number;
  quantity?: number;
  min_quantity?: number;
  max_quantity?: number;
  unit?: string;
  status?: 'active' | 'inactive';
} 