// ─── Restaurant Model — SQL Server ───────────────────────────────────────────
// Class Diagram: Restaurant
//   - restName, restRate, restMaxDeliveryTime, restMinDeliveryTime,
//     restDeliveryCost, restLocation, openTime, closeTime, isOpen
//   + checkOperatingStatus(): boolean

import { getPool } from '../database';
import * as sql from 'mssql';

export interface Restaurant {
  id: number;
  name: string;
  location: string;
  rating: number;
  deliveryTime: number;
  deliveryPrice: number;
  openTime: string;
  closeTime: string;
}

function rowToRestaurant(row: any): Restaurant {
  const idValue = row.id !== undefined ? row.id : (row.ID !== undefined ? row.ID : row.Id);
  return {
    id: Number(idValue),
    name: row.name,
    location: row.location,
    rating: row.rating,
    deliveryTime: row.delivery_time,
    deliveryPrice: row.delivery_price,
    openTime: row.open_time,
    closeTime: row.close_time,
  };
}

export const RestaurantStore = {
  /** Return all restaurants */
  async findAll(): Promise<Restaurant[]> {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM [Restaurant]');
    return result.recordset.map(rowToRestaurant);
  },

  /** Find by id */
  async findById(id: number | string): Promise<Restaurant | undefined> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, Number(id))
      .query('SELECT * FROM [Restaurant] WHERE id = @id');
    if (result.recordset.length === 0) return undefined;
    return rowToRestaurant(result.recordset[0]);
  },

  /** Find by name (case-insensitive) */
  async findByName(name: string): Promise<Restaurant | undefined> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar, name.trim().toLowerCase())
      .query('SELECT * FROM [Restaurant] WHERE LOWER(name) = @name');
    if (result.recordset.length === 0) return undefined;
    return rowToRestaurant(result.recordset[0]);
  },

  /** Add a new restaurant */
  async add(data: Omit<Restaurant, 'id' | 'rating'>): Promise<Restaurant> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar, data.name.trim())
      .input('location', sql.NVarChar, data.location.trim())
      .input('delivery_price', sql.Float, data.deliveryPrice)
      .input('delivery_time', sql.Int, data.deliveryTime)
      .input('open_time', sql.NVarChar, data.openTime || '')
      .input('close_time', sql.NVarChar, data.closeTime || '')
      .query(`
        INSERT INTO [Restaurant] (name, rating, delivery_time, min_delivery_time, max_delivery_time, delivery_price, location, open_time, close_time)
        OUTPUT INSERTED.*
        VALUES (@name, 0, @delivery_time, @delivery_time, @delivery_time + 15, @delivery_price, @location, @open_time, @close_time)
      `);
    return rowToRestaurant(result.recordset[0]);
  },

  /** Update fields on an existing restaurant */
  async update(id: number | string, data: Partial<Omit<Restaurant, 'id'>>): Promise<Restaurant | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;

    const merged = { ...existing, ...data };
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, Number(id))
      .input('name', sql.NVarChar, merged.name)
      .input('location', sql.NVarChar, merged.location)
      .input('delivery_price', sql.Float, merged.deliveryPrice)
      .input('delivery_time', sql.Int, merged.deliveryTime)
      .input('open_time', sql.NVarChar, merged.openTime)
      .input('close_time', sql.NVarChar, merged.closeTime)
      .input('rating', sql.Float, merged.rating)
      .query(`
        UPDATE [Restaurant]
        SET name = @name, location = @location, delivery_price = @delivery_price,
            delivery_time = @delivery_time,
            min_delivery_time = @delivery_time,
            max_delivery_time = @delivery_time + 15,
            open_time = @open_time, close_time = @close_time, rating = @rating
        WHERE id = @id
      `);
    return this.findById(id);
  },

  /** Remove a restaurant */
  async remove(id: number | string): Promise<boolean> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, Number(id))
      .query('DELETE FROM [Restaurant] WHERE id = @id');
    return (result.rowsAffected[0] ?? 0) > 0;
  },

  /** Class Diagram: checkOperatingStatus(): boolean */
  checkOperatingStatus(restaurant: Restaurant): boolean {
    if (!restaurant.openTime || !restaurant.closeTime) return false;
    const now = new Date();
    const [oh, om] = restaurant.openTime.split(':').map(Number);
    const [ch, cm] = restaurant.closeTime.split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const openMins = oh * 60 + om;
    const closeMins = ch * 60 + cm;
    return nowMins >= openMins && nowMins < closeMins;
  },
};
