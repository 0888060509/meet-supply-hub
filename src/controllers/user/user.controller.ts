import { Request, Response } from 'express';
import { UserService } from '@/services/user/user.service';
import { UserCreateInput, UserUpdateInput } from '@/models/user/user.model';
import { RoleId } from '@/types/role';

export class UserController {
  constructor(private userService: UserService) {}

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(user);
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.findAll();
      return res.json(users);
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(user);
    } catch (error) {
      console.error('Error in getUserById:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const userData: UserCreateInput = {
        ...req.body,
        roles: [req.body.role as RoleId],
        status: 'active'
      };

      const user = await this.userService.create(userData);
      return res.status(201).json(user);
    } catch (error: any) {
      console.error('Error in createUser:', error);
      if (error.message === 'Username already exists' || error.message === 'Email already exists') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UserUpdateInput = {
        ...req.body,
        roles: req.body.role ? [req.body.role as RoleId] : undefined
      };

      const user = await this.userService.update(id, updateData);
      return res.json(user);
    } catch (error: any) {
      console.error('Error in updateUser:', error);
      if (error.message === 'Email already exists') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.userService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const user = await this.userService.updateStatus(id, status as 'active' | 'inactive');
      return res.json(user);
    } catch (error) {
      console.error('Error in updateUserStatus:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 