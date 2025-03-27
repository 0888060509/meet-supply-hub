import { Product, ProductCreateInput, ProductUpdateInput } from '@/models/product/product.model';

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  findByCategory(category: string): Promise<Product[]>;
  create(data: ProductCreateInput): Promise<Product>;
  update(id: string, data: ProductUpdateInput): Promise<Product>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: 'active' | 'inactive'): Promise<Product>;
  updateQuantity(id: string, quantity: number): Promise<Product>;
  search(query: string): Promise<Product[]>;
} 