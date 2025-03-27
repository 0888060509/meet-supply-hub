import { Role, RoleCreateInput, RoleUpdateInput } from '@/models/role/role.model';

export interface RoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  create(data: RoleCreateInput): Promise<Role>;
  update(id: string, data: RoleUpdateInput): Promise<Role>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<Role[]>;
} 