import { Warehouse, WarehouseCreateInput, WarehouseUpdateInput } from '@/models/warehouse/warehouse.model';
import { WarehouseRepository } from '@/repositories/warehouse/warehouse.repository';
import { UserService } from '@/services/user/user.service';

export class WarehouseService {
  constructor(
    private warehouseRepository: WarehouseRepository,
    private userService: UserService
  ) {}

  async findById(id: string): Promise<Warehouse | null> {
    return this.warehouseRepository.findById(id);
  }

  async findByName(name: string): Promise<Warehouse | null> {
    return this.warehouseRepository.findByName(name);
  }

  async findAll(): Promise<Warehouse[]> {
    return this.warehouseRepository.findAll();
  }

  async findByManagerId(managerId: string): Promise<Warehouse[]> {
    return this.warehouseRepository.findByManagerId(managerId);
  }

  async create(data: WarehouseCreateInput): Promise<Warehouse> {
    // Check if warehouse name already exists
    const existingWarehouse = await this.findByName(data.name);
    if (existingWarehouse) {
      throw new Error('Warehouse name already exists');
    }

    // Validate manager exists
    const manager = await this.userService.findById(data.manager_id);
    if (!manager) {
      throw new Error('Manager not found');
    }

    return this.warehouseRepository.create({
      ...data,
      status: 'active'
    });
  }

  async update(id: string, data: WarehouseUpdateInput): Promise<Warehouse> {
    // Check if warehouse name is being changed and if it already exists
    if (data.name) {
      const existingWarehouse = await this.findByName(data.name);
      if (existingWarehouse && existingWarehouse.id !== id) {
        throw new Error('Warehouse name already exists');
      }
    }

    // Validate manager exists if being changed
    if (data.manager_id) {
      const manager = await this.userService.findById(data.manager_id);
      if (!manager) {
        throw new Error('Manager not found');
      }
    }

    return this.warehouseRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.warehouseRepository.delete(id);
  }

  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<Warehouse> {
    return this.warehouseRepository.updateStatus(id, status);
  }

  async search(query: string): Promise<Warehouse[]> {
    return this.warehouseRepository.search(query);
  }
} 