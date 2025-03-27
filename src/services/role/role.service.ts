import { Role, RoleCreateInput, RoleUpdateInput } from '@/models/role/role.model';
import { RoleRepository } from '@/repositories/role/role.repository';

export class RoleService {
  constructor(private roleRepository: RoleRepository) {}

  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findByName(name);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async create(data: RoleCreateInput): Promise<Role> {
    // Check if role name already exists
    const existingRole = await this.findByName(data.name);
    if (existingRole) {
      throw new Error('Role name already exists');
    }

    return this.roleRepository.create(data);
  }

  async update(id: string, data: RoleUpdateInput): Promise<Role> {
    // Check if role name is being changed and if it already exists
    if (data.name) {
      const existingRole = await this.findByName(data.name);
      if (existingRole && existingRole.id !== id) {
        throw new Error('Role name already exists');
      }
    }

    return this.roleRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.roleRepository.delete(id);
  }

  async search(query: string): Promise<Role[]> {
    return this.roleRepository.search(query);
  }
} 