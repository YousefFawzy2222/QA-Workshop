// ─── Order_item Model — SQL Server ───────────────────────────────────────────

import { getPool } from '../database';
import * as sql from 'mssql';

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  unitPrice: number;
}

function rowToOrderItem(row: any): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    menuItemId: row.menu_item_id,
    quantity: row.quantity,
    unitPrice: row.unit_price,
  };
}

export const OrderItemStore = {
  async addItems(orderId: number, items: { menuItemId: number; quantity: number; unitPrice: number }[]): Promise<OrderItem[]> {
    const pool = await getPool();
    const results: OrderItem[] = [];
    for (const item of items) {
      const result = await pool
        .request()
        .input('order_id', sql.Int, orderId)
        .input('menu_item_id', sql.Int, item.menuItemId)
        .input('quantity', sql.Int, item.quantity)
        .input('unit_price', sql.Float, item.unitPrice)
        .query(`
          INSERT INTO [Order_item] (order_id, menu_item_id, quantity, unit_price)
          OUTPUT INSERTED.*
          VALUES (@order_id, @menu_item_id, @quantity, @unit_price)
        `);
      results.push(rowToOrderItem(result.recordset[0]));
    }
    return results;
  },

  async findByOrder(orderId: number | string): Promise<OrderItem[]> {
    const pool = await getPool();
    const result = await pool.request()
      .input('order_id', sql.Int, Number(orderId))
      .query('SELECT * FROM [Order_item] WHERE order_id = @order_id');
    return result.recordset.map(rowToOrderItem);
  },
};
