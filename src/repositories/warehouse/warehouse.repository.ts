import { Warehouse, WarehouseCreateInput, WarehouseUpdateInput } from '@/models/warehouse/warehouse.model';

export interface WarehouseRepository {
  findById(id: string): Promise<Warehouse | null>;
  findByName(name: string): Promise<Warehouse | null>;
  findAll(): Promise<Warehouse[]>;
  findByManagerId(managerId: string): Promise<Warehouse[]>;
  create(data: WarehouseCreateInput): Promise<Warehouse>;
  update(id: string, data: WarehouseUpdateInput): Promise<Warehouse>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: 'active' | 'inactive'): Promise<Warehouse>;
  search(query: string): Promise<Warehouse[]>;
} 