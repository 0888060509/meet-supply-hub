import type { Request, Response } from 'express';
import { WarehouseService } from '@/services/warehouse/warehouse.service';
import { WarehouseCreateInput, WarehouseUpdateInput } from '@/models/warehouse/warehouse.model';

export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  async getAllWarehouses(req: Request, res: Response) {
    try {
      const warehouses = await this.warehouseService.findAll();
      return res.json(warehouses);
    } catch (error) {
      console.error('Error in getAllWarehouses:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getWarehouseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const warehouse = await this.warehouseService.findById(id);

      if (!warehouse) {
        return res.status(404).json({ message: 'Warehouse not found' });
      }

      return res.json(warehouse);
    } catch (error) {
      console.error('Error in getWarehouseById:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createWarehouse(req: Request, res: Response) {
    try {
      const warehouseData: WarehouseCreateInput = req.body;
      const warehouse = await this.warehouseService.create(warehouseData);
      return res.status(201).json(warehouse);
    } catch (error: any) {
      console.error('Error in createWarehouse:', error);
      if (error.message === 'Warehouse name already exists' || 
          error.message === 'Manager not found') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: WarehouseUpdateInput = req.body;

      const warehouse = await this.warehouseService.update(id, updateData);
      return res.json(warehouse);
    } catch (error: any) {
      console.error('Error in updateWarehouse:', error);
      if (error.message === 'Warehouse name already exists' || 
          error.message === 'Manager not found') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.warehouseService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error in deleteWarehouse:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateWarehouseStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const warehouse = await this.warehouseService.updateStatus(id, status as 'active' | 'inactive');
      return res.json(warehouse);
    } catch (error) {
      console.error('Error in updateWarehouseStatus:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async searchWarehouses(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const warehouses = await this.warehouseService.search(query);
      return res.json(warehouses);
    } catch (error) {
      console.error('Error in searchWarehouses:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 