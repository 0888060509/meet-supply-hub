import type { Request, Response } from 'express';
import { RoleService } from '@/services/role/role.service';
import { RoleCreateInput, RoleUpdateInput } from '@/models/role/role.model';

export class RoleController {
  constructor(private roleService: RoleService) {}

  async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await this.roleService.findAll();
      return res.json(roles);
    } catch (error) {
      console.error('Error in getAllRoles:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getRoleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const role = await this.roleService.findById(id);

      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      return res.json(role);
    } catch (error) {
      console.error('Error in getRoleById:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createRole(req: Request, res: Response) {
    try {
      const roleData: RoleCreateInput = req.body;
      const role = await this.roleService.create(roleData);
      return res.status(201).json(role);
    } catch (error: any) {
      console.error('Error in createRole:', error);
      if (error.message === 'Role name already exists') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: RoleUpdateInput = req.body;

      const role = await this.roleService.update(id, updateData);
      return res.json(role);
    } catch (error: any) {
      console.error('Error in updateRole:', error);
      if (error.message === 'Role name already exists') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.roleService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error in deleteRole:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async searchRoles(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const roles = await this.roleService.search(query);
      return res.json(roles);
    } catch (error) {
      console.error('Error in searchRoles:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 