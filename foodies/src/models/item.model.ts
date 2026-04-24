// ─── Item (Menu_item) Model — SQL Server ─────────────────────────────────────
// Class Diagram: Item
//   - itemName, itemCost, itemQuantity, isCombo, itemSize,
//     isOnDiscount, discountPercentage, description
//   + validateItem(), validateItemOnDiscount(), getDiscountedPrice(), addItem()

import { getPool } from '../database';
import * as sql from 'mssql';

export interface Item {
  id: number;
  restaurantId: number;
  itemName: string;
  itemCost: number;
  itemQuantity: number;
  isCombo: boolean;
  itemSize: string;
  isOnDiscount: boolean;
  discountPercentage: number;
  description: string;
}

function rowToItem(row: any): Item {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    itemName: row.name,
    itemCost: row.price,
    itemQuantity: row.item_quantity,
    isCombo: row.is_combo,
    itemSize: row.item_size,
    isOnDiscount: row.is_on_discount,
    discountPercentage: row.discount_percentage,
    description: row.description,
  };
}

export const ItemStore = {
  /** Return all items for a restaurant */
  async findByRestaurant(restaurantId: number | string): Promise<Item[]> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('restaurantId', sql.Int, Number(restaurantId))
      .query('SELECT * FROM [Menu_item] WHERE restaurant_id = @restaurantId');
    return result.recordset.map(rowToItem);
  },

  /** Find a single item by id */
  async findById(id: number | string): Promise<Item | undefined> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, Number(id))
      .query('SELECT * FROM [Menu_item] WHERE id = @id');
    if (result.recordset.length === 0) return undefined;
    return rowToItem(result.recordset[0]);
  },

  /** Find by name within a restaurant (case-insensitive) */
  async findByNameInRestaurant(restaurantId: number | string, name: string): Promise<Item | undefined> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('restaurantId', sql.Int, Number(restaurantId))
      .input('name', sql.NVarChar, name.trim().toLowerCase())
      .query('SELECT * FROM [Menu_item] WHERE restaurant_id = @restaurantId AND LOWER(name) = @name');
    if (result.recordset.length === 0) return undefined;
    return rowToItem(result.recordset[0]);
  },

  /** Add a new item */
  async add(data: Omit<Item, 'id'>): Promise<Item> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('restaurant_id', sql.Int, Number(data.restaurantId))
      .input('name', sql.NVarChar, data.itemName.trim())
      .input('price', sql.Float, data.itemCost)
      .input('item_quantity', sql.Int, data.itemQuantity)
      .input('is_combo', sql.Bit, data.isCombo ? 1 : 0)
      .input('item_size', sql.NVarChar, data.itemSize.trim())
      .input('description', sql.NVarChar, data.description.trim())
      .input('is_on_discount', sql.Bit, data.isOnDiscount ? 1 : 0)
      .input('discount_percentage', sql.Float, data.discountPercentage)
      .query(`
        INSERT INTO [Menu_item] (restaurant_id, name, price, item_quantity, is_combo, item_size, description, is_on_discount, discount_percentage)
        OUTPUT INSERTED.*
        VALUES (@restaurant_id, @name, @price, @item_quantity, @is_combo, @item_size, @description, @is_on_discount, @discount_percentage)
      `);
    return rowToItem(result.recordset[0]);
  },

  /** Update an existing item */
  async update(id: number | string, data: Partial<Omit<Item, 'id' | 'restaurantId'>>): Promise<Item | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;

    const merged = { ...existing, ...data };
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, Number(id))
      .input('name', sql.NVarChar, merged.itemName)
      .input('price', sql.Float, merged.itemCost)
      .input('item_quantity', sql.Int, merged.itemQuantity)
      .input('is_combo', sql.Bit, merged.isCombo ? 1 : 0)
      .input('item_size', sql.NVarChar, merged.itemSize)
      .input('description', sql.NVarChar, merged.description)
      .input('is_on_discount', sql.Bit, merged.isOnDiscount ? 1 : 0)
      .input('discount_percentage', sql.Float, merged.discountPercentage)
      .query(`
        UPDATE [Menu_item]
        SET name = @name, price = @price, item_quantity = @item_quantity, is_combo = @is_combo,
            item_size = @item_size, description = @description, is_on_discount = @is_on_discount,
            discount_percentage = @discount_percentage
        WHERE id = @id
      `);
    return this.findById(id);
  },

  /** Remove an item */
  async remove(id: number | string): Promise<boolean> {
    const pool = await getPool();
    // Delete related offers first
    await pool.request().input('id', sql.Int, Number(id))
      .query('DELETE FROM [Offers] WHERE menu_item_id = @id');
    const result = await pool
      .request()
      .input('id', sql.Int, Number(id))
      .query('DELETE FROM [Menu_item] WHERE id = @id');
    return (result.rowsAffected[0] ?? 0) > 0;
  },

  /** Remove all items for a restaurant (cascade from deleteRestaurant) */
  async removeByRestaurant(restaurantId: number | string): Promise<void> {
    const pool = await getPool();
    // Delete related offers first
    await pool.request().input('rid', sql.Int, Number(restaurantId))
      .query('DELETE FROM [Offers] WHERE menu_item_id IN (SELECT id FROM [Menu_item] WHERE restaurant_id = @rid)');
    // Delete related order_items
    await pool.request().input('rid', sql.Int, Number(restaurantId))
      .query('DELETE FROM [Order_item] WHERE menu_item_id IN (SELECT id FROM [Menu_item] WHERE restaurant_id = @rid)');
    await pool.request().input('rid', sql.Int, Number(restaurantId))
      .query('DELETE FROM [Menu_item] WHERE restaurant_id = @rid');
  },

  // ─── Class Diagram Methods (pure validation, no DB) ──────────────────────

  validateItem(data: {
    itemName?: string;
    itemCost?: number;
    itemQuantity?: number;
    itemSize?: string;
    description?: string;
    isCombo?: boolean;
  }): string | null {
    if (!data.itemName || data.itemName.trim().length === 0) {
      return 'Item name is required';
    }
    if (data.itemCost === undefined || isNaN(data.itemCost) || data.itemCost < 0) {
      return 'Item cost must be a non-negative number';
    }
    if (data.itemQuantity === undefined || isNaN(data.itemQuantity) || data.itemQuantity < 0) {
      return 'Quantity must be a non-negative number';
    }
    if (!data.itemSize || data.itemSize.trim().length === 0) {
      return 'Item size is required';
    }
    return null;
  },

  validateItemOnDiscount(discountPercentage: number): string | null {
    if (isNaN(discountPercentage) || discountPercentage <= 0 || discountPercentage > 100) {
      return 'Discount percentage must be between 1 and 100';
    }
    return null;
  },

  getDiscountedPrice(item: Item): number {
    if (!item.isOnDiscount || item.discountPercentage <= 0) return item.itemCost;
    return parseFloat(
      (item.itemCost * (1 - item.discountPercentage / 100)).toFixed(2)
    );
  },
};
