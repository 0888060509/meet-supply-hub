import { Product, ProductCreateInput, ProductUpdateInput } from '@/models/product/product.model';
import { ProductRepository } from '@/repositories/product/product.repository';

export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  async findById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productRepository.findBySku(sku);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.productRepository.findByCategory(category);
  }

  async create(data: ProductCreateInput): Promise<Product> {
    // Check if SKU already exists
    const existingProduct = await this.findBySku(data.sku);
    if (existingProduct) {
      throw new Error('SKU already exists');
    }

    // Validate quantity
    if (data.quantity < data.min_quantity) {
      throw new Error('Initial quantity cannot be less than minimum quantity');
    }
    if (data.quantity > data.max_quantity) {
      throw new Error('Initial quantity cannot be greater than maximum quantity');
    }

    return this.productRepository.create(data);
  }

  async update(id: string, data: ProductUpdateInput): Promise<Product> {
    // Check if SKU is being changed and if it already exists
    if (data.sku) {
      const existingProduct = await this.findBySku(data.sku);
      if (existingProduct && existingProduct.id !== id) {
        throw new Error('SKU already exists');
      }
    }

    // Validate quantity if being updated
    if (data.quantity !== undefined) {
      const product = await this.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      const minQuantity = data.min_quantity ?? product.min_quantity;
      const maxQuantity = data.max_quantity ?? product.max_quantity;

      if (data.quantity < minQuantity) {
        throw new Error('Quantity cannot be less than minimum quantity');
      }
      if (data.quantity > maxQuantity) {
        throw new Error('Quantity cannot be greater than maximum quantity');
      }
    }

    return this.productRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.productRepository.delete(id);
  }

  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<Product> {
    return this.productRepository.updateStatus(id, status);
  }

  async updateQuantity(id: string, quantity: number): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (quantity < product.min_quantity) {
      throw new Error('Quantity cannot be less than minimum quantity');
    }
    if (quantity > product.max_quantity) {
      throw new Error('Quantity cannot be greater than maximum quantity');
    }

    return this.productRepository.updateQuantity(id, quantity);
  }

  async search(query: string): Promise<Product[]> {
    return this.productRepository.search(query);
  }
} 