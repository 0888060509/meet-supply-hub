import { Request, Response } from 'express';
import { ProductService } from '@/services/product/product.service';
import { ProductCreateInput, ProductUpdateInput } from '@/models/product/product.model';

export class ProductController {
  constructor(private productService: ProductService) {}

  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await this.productService.findAll();
      return res.json(products);
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await this.productService.findById(id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.json(product);
    } catch (error) {
      console.error('Error in getProductById:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const productData: ProductCreateInput = {
        ...req.body,
        status: 'active'
      };

      const product = await this.productService.create(productData);
      return res.status(201).json(product);
    } catch (error: any) {
      console.error('Error in createProduct:', error);
      if (error.message === 'SKU already exists' || 
          error.message.includes('quantity')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: ProductUpdateInput = req.body;

      const product = await this.productService.update(id, updateData);
      return res.json(product);
    } catch (error: any) {
      console.error('Error in updateProduct:', error);
      if (error.message === 'SKU already exists' || 
          error.message.includes('quantity') ||
          error.message === 'Product not found') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.productService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateProductStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const product = await this.productService.updateStatus(id, status as 'active' | 'inactive');
      return res.json(product);
    } catch (error) {
      console.error('Error in updateProductStatus:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateProductQuantity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (typeof quantity !== 'number') {
        return res.status(400).json({ message: 'Quantity must be a number' });
      }

      const product = await this.productService.updateQuantity(id, quantity);
      return res.json(product);
    } catch (error: any) {
      console.error('Error in updateProductQuantity:', error);
      if (error.message.includes('quantity') || error.message === 'Product not found') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }

  async searchProducts(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const products = await this.productService.search(query);
      return res.json(products);
    } catch (error) {
      console.error('Error in searchProducts:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 