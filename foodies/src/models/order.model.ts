// ─── Order Model — SQL Server ────────────────────────────────────────────────
// Class Diagram: Order
//   - orderId, placedAt, status, items, deliveryAddress, orderTotal,
//     deliveryFee, pointsEarned, paymentMethod = COD
//   + calculateTotal(), accruePoints()

import { getPool } from '../database';
import * as sql from 'mssql';

export interface Order {
  id: number;
  userEmail: string;
  restaurantId: number;
  addressId: number | null;
  subTotal: number;
  deliveryPrice: number;
  totalPrice: number;
  pointsRedeemed: number;
  pointsEarned: number;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
}

function rowToOrder(row: any): Order {
  return {
    id: row.id,
    userEmail: row.user_email,
    restaurantId: row.restaurant_id,
    addressId: row.address_id,
    subTotal: row.sub_total,
    deliveryPrice: row.delivery_price,
    totalPrice: row.total_price,
    pointsRedeemed: row.points_redeemed,
    pointsEarned: row.points_earned,
    orderStatus: row.order_status,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
  };
}

export const OrderStore = {
  async create(data: Omit<Order, 'id'>): Promise<Order> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('user_email', sql.NVarChar, data.userEmail)
      .input('restaurant_id', sql.Int, data.restaurantId)
      .input('address_id', sql.Int, data.addressId)
      .input('sub_total', sql.Float, data.subTotal)
      .input('delivery_price', sql.Float, data.deliveryPrice)
      .input('total_price', sql.Float, data.totalPrice)
      .input('points_redeemed', sql.Int, data.pointsRedeemed)
      .input('points_earned', sql.Int, data.pointsEarned)
      .input('order_status', sql.NVarChar, data.orderStatus)
      .input('payment_method', sql.NVarChar, data.paymentMethod)
      .input('created_at', sql.NVarChar, data.createdAt)
      .query(`
        INSERT INTO [Order] (user_email, restaurant_id, address_id, sub_total, delivery_price, total_price, points_redeemed, points_earned, order_status, payment_method, created_at)
        OUTPUT INSERTED.*
        VALUES (@user_email, @restaurant_id, @address_id, @sub_total, @delivery_price, @total_price, @points_redeemed, @points_earned, @order_status, @payment_method, @created_at)
      `);
    return rowToOrder(result.recordset[0]);
  },

  async findByUser(userEmail: string): Promise<Order[]> {
    const pool = await getPool();
    const result = await pool.request()
      .input('user_email', sql.NVarChar, userEmail)
      .query('SELECT * FROM [Order] WHERE user_email = @user_email ORDER BY id DESC');
    return result.recordset.map(rowToOrder);
  },

  async findById(id: number | string): Promise<Order | undefined> {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query('SELECT * FROM [Order] WHERE id = @id');
    if (result.recordset.length === 0) return undefined;
    return rowToOrder(result.recordset[0]);
  },

  /** Class Diagram: calculateTotal(): float */
  calculateTotal(subTotal: number, deliveryFee: number, pointsDiscount: number): number {
    return parseFloat((subTotal + deliveryFee - pointsDiscount).toFixed(2));
  },

  /** Class Diagram: accruePoints(): int — 10% of order total */
  accruePoints(orderTotal: number): number {
    return Math.floor(orderTotal * 0.1);
  },
};
