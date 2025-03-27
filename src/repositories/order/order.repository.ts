import { Order, OrderCreateInput, OrderUpdateInput } from '@/models/order/order.model';

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  findByStatus(status: Order['status']): Promise<Order[]>;
  findByPaymentStatus(paymentStatus: Order['payment_status']): Promise<Order[]>;
  create(data: OrderCreateInput): Promise<Order>;
  update(id: string, data: OrderUpdateInput): Promise<Order>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: Order['status']): Promise<Order>;
  updatePaymentStatus(id: string, paymentStatus: Order['payment_status']): Promise<Order>;
  search(query: string): Promise<Order[]>;
} 