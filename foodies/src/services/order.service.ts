// ─── Order Service ───────────────────────────────────────────────────────────

import { OrderStore, Order } from '../models/order.model';
import { OrderItemStore } from '../models/order-item.model';

export interface OrderResult {
  success: boolean;
  order?: Order;
  orders?: Order[];
  items?: any[];
  error?: string;
}

export async function getUserOrders(userEmail: string): Promise<OrderResult> {
  const orders = await OrderStore.findByUser(userEmail);
  return { success: true, orders };
}

export async function getOrderById(id: string): Promise<OrderResult> {
  const order = await OrderStore.findById(id);
  if (!order) return { success: false, error: 'Order not found' };
  const items = await OrderItemStore.findByOrder(id);
  return { success: true, order, items };
}
