import { Order, OrderCreateInput, OrderUpdateInput } from '@/models/order/order.model';
import { OrderRepository } from '@/repositories/order/order.repository';
import { ProductService } from '@/services/product/product.service';

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private productService: ProductService
  ) {}

  async findById(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.orderRepository.findByOrderNumber(orderNumber);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async findByStatus(status: Order['status']): Promise<Order[]> {
    return this.orderRepository.findByStatus(status);
  }

  async findByPaymentStatus(paymentStatus: Order['payment_status']): Promise<Order[]> {
    return this.orderRepository.findByPaymentStatus(paymentStatus);
  }

  async create(data: OrderCreateInput): Promise<Order> {
    // Validate product quantities
    for (const item of data.items) {
      const product = await this.productService.findById(item.product_id);
      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient quantity for product ${product.name}`);
      }
    }

    // Calculate total amount
    const totalAmount = data.items.reduce((sum, item) => sum + item.total, 0);

    // Create order
    const order = await this.orderRepository.create({
      ...data,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending'
    });

    // Update product quantities
    for (const item of data.items) {
      const product = await this.productService.findById(item.product_id);
      if (product) {
        await this.productService.updateQuantity(product.id, product.quantity - item.quantity);
      }
    }

    return order;
  }

  async update(id: string, data: OrderUpdateInput): Promise<Order> {
    const order = await this.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // If updating items, validate quantities
    if (data.items) {
      for (const item of data.items) {
        const product = await this.productService.findById(item.product_id);
        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }
        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient quantity for product ${product.name}`);
        }
      }
    }

    // Update order
    const updatedOrder = await this.orderRepository.update(id, data);

    // If updating items, update product quantities
    if (data.items) {
      // Restore old quantities
      for (const item of order.items) {
        const product = await this.productService.findById(item.product_id);
        if (product) {
          await this.productService.updateQuantity(product.id, product.quantity + item.quantity);
        }
      }

      // Deduct new quantities
      for (const item of data.items) {
        const product = await this.productService.findById(item.product_id);
        if (product) {
          await this.productService.updateQuantity(product.id, product.quantity - item.quantity);
        }
      }
    }

    return updatedOrder;
  }

  async delete(id: string): Promise<void> {
    const order = await this.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Restore product quantities
    for (const item of order.items) {
      const product = await this.productService.findById(item.product_id);
      if (product) {
        await this.productService.updateQuantity(product.id, product.quantity + item.quantity);
      }
    }

    return this.orderRepository.delete(id);
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    return this.orderRepository.updateStatus(id, status);
  }

  async updatePaymentStatus(id: string, paymentStatus: Order['payment_status']): Promise<Order> {
    return this.orderRepository.updatePaymentStatus(id, paymentStatus);
  }

  async search(query: string): Promise<Order[]> {
    return this.orderRepository.search(query);
  }
} 