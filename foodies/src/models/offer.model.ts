// ─── Offers Model — SQL Server ───────────────────────────────────────────────
// Class Diagram: Offers
//   - itemsOnSale: Item[], startDate, endDate, offerName
//   + isExpired(), getDiscountedPrice(), validateOffer()

import { getPool } from '../database';
import * as sql from 'mssql';

export interface Offer {
  id: number;
  menuItemId: number;
  discountPercentage: number;
  originalPrice: number;
  discountedPrice: number;
  offerName: string;
  startsAt: string;
  expiresAt: string;
}

function rowToOffer(row: any): Offer {
  return {
    id: row.id,
    menuItemId: row.menu_item_id,
    discountPercentage: row.discount_percentage,
    originalPrice: row.original_price,
    discountedPrice: row.discounted_price,
    offerName: row.offer_name,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
  };
}

export const OfferStore = {
  async create(data: Omit<Offer, 'id'>): Promise<Offer> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('menu_item_id', sql.Int, data.menuItemId)
      .input('discount_percentage', sql.Float, data.discountPercentage)
      .input('original_price', sql.Float, data.originalPrice)
      .input('discounted_price', sql.Float, data.discountedPrice)
      .input('offer_name', sql.NVarChar, data.offerName)
      .input('starts_at', sql.NVarChar, data.startsAt)
      .input('expires_at', sql.NVarChar, data.expiresAt)
      .query(`
        INSERT INTO [Offers] (menu_item_id, discount_percentage, original_price, discounted_price, offer_name, starts_at, expires_at)
        OUTPUT INSERTED.*
        VALUES (@menu_item_id, @discount_percentage, @original_price, @discounted_price, @offer_name, @starts_at, @expires_at)
      `);
    return rowToOffer(result.recordset[0]);
  },

  async update(id: number | string, data: Partial<Omit<Offer, 'id'>>): Promise<Offer | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;
    const merged = { ...existing, ...data };
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, Number(id))
      .input('menu_item_id', sql.Int, merged.menuItemId)
      .input('discount_percentage', sql.Float, merged.discountPercentage)
      .input('original_price', sql.Float, merged.originalPrice)
      .input('discounted_price', sql.Float, merged.discountedPrice)
      .input('offer_name', sql.NVarChar, merged.offerName)
      .input('starts_at', sql.NVarChar, merged.startsAt)
      .input('expires_at', sql.NVarChar, merged.expiresAt)
      .query(`
        UPDATE [Offers]
        SET menu_item_id = @menu_item_id, discount_percentage = @discount_percentage,
            original_price = @original_price, discounted_price = @discounted_price,
            offer_name = @offer_name, starts_at = @starts_at, expires_at = @expires_at
        WHERE id = @id
      `);
    return this.findById(id);
  },

  async delete(id: number | string): Promise<boolean> {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, Number(id))
      .query('DELETE FROM [Offers] WHERE id = @id');
    return (result.rowsAffected[0] ?? 0) > 0;
  },

  async findById(id: number | string): Promise<Offer | undefined> {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, Number(id))
      .query('SELECT * FROM [Offers] WHERE id = @id');
    if (result.recordset.length === 0) return undefined;
    return rowToOffer(result.recordset[0]);
  },

  async findByMenuItem(menuItemId: number | string): Promise<Offer | undefined> {
    const pool = await getPool();
    const result = await pool.request().input('mid', sql.Int, Number(menuItemId))
      .query('SELECT * FROM [Offers] WHERE menu_item_id = @mid');
    if (result.recordset.length === 0) return undefined;
    return rowToOffer(result.recordset[0]);
  },

  async findAll(): Promise<Offer[]> {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM [Offers]');
    return result.recordset.map(rowToOffer);
  },

  async findActive(): Promise<Offer[]> {
    const pool = await getPool();
    const now = new Date().toISOString();
    const result = await pool.request().input('now', sql.NVarChar, now)
      .query('SELECT * FROM [Offers] WHERE starts_at <= @now AND expires_at >= @now');
    return result.recordset.map(rowToOffer);
  },

  /** Class Diagram: isExpired(): boolean */
  isExpired(offer: Offer): boolean {
    if (!offer.expiresAt) return false;
    return new Date(offer.expiresAt) < new Date();
  },

  /** Class Diagram: getDiscountedPrice(): float */
  getDiscountedPrice(originalPrice: number, discountPercentage: number): number {
    return parseFloat((originalPrice * (1 - discountPercentage / 100)).toFixed(2));
  },

  /** Class Diagram: validateOffer(): void — returns error string or null */
  validateOffer(data: { menuItemId?: number; discountPercentage?: number; startsAt?: string; expiresAt?: string; offerName?: string }): string | null {
    if (!data.menuItemId) return 'Menu item is required';
    if (!data.offerName || data.offerName.trim().length === 0) return 'Offer name is required';
    if (!data.discountPercentage || data.discountPercentage <= 0 || data.discountPercentage > 100) {
      return 'Discount percentage must be between 1 and 100';
    }
    if (!data.startsAt) return 'Start date is required';
    if (!data.expiresAt) return 'End date is required';
    if (new Date(data.expiresAt) <= new Date(data.startsAt)) {
      return 'End date must be after start date';
    }
    return null;
  },
};
