// ─── Address (AddressOfUser) Model — SQL Server ─────────────────────────────
// Class Diagram: AddressOfUser
//   - phoneNumber, buildingName, aptNumber, floorNumber, street, nearbyLandmark
//   + validateUserInfo(), saveAddress(), validatePhoneNumber()

import { getPool } from '../database';
import * as sql from 'mssql';

export interface Address {
  id: number;
  userEmail: string;
  phone: string;
  building: string;
  apartment: string;
  floor: string;
  street: string;
  landmark: string;
  isPrimary: boolean;
}

function rowToAddress(row: any): Address {
  return {
    id: row.id,
    userEmail: row.user_email,
    phone: row.phone_number,
    building: row.building_name,
    apartment: row.apartment || '',
    floor: row.floor_number || '',
    street: row.street,
    landmark: row.nearby_landmark || '',
    isPrimary: false,
  };
}

export const AddressStore = {
  async add(address: Omit<Address, 'id'>): Promise<Address> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input('user_email', sql.NVarChar, address.userEmail)
      .input('phone_number', sql.NVarChar, address.phone)
      .input('building_name', sql.NVarChar, address.building)
      .input('apartment', sql.NVarChar, address.apartment || '')
      .input('floor_number', sql.NVarChar, address.floor || '')
      .input('street', sql.NVarChar, address.street)
      .input('nearby_landmark', sql.NVarChar, address.landmark || '')
      .query(`
        INSERT INTO [Address] (user_email, phone_number, building_name, apartment, floor_number, street, nearby_landmark)
        OUTPUT INSERTED.*
        VALUES (@user_email, @phone_number, @building_name, @apartment, @floor_number, @street, @nearby_landmark)
      `);
    return rowToAddress(result.recordset[0]);
  },

  async update(id: number | string, updates: Partial<Omit<Address, 'id' | 'userEmail'>>): Promise<Address | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;

    const merged = { ...existing, ...updates };
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, Number(id))
      .input('phone_number', sql.NVarChar, merged.phone)
      .input('building_name', sql.NVarChar, merged.building)
      .input('apartment', sql.NVarChar, merged.apartment)
      .input('floor_number', sql.NVarChar, merged.floor)
      .input('street', sql.NVarChar, merged.street)
      .input('nearby_landmark', sql.NVarChar, merged.landmark)
      .query(`
        UPDATE [Address]
        SET phone_number = @phone_number, building_name = @building_name, apartment = @apartment,
            floor_number = @floor_number, street = @street, nearby_landmark = @nearby_landmark
        WHERE id = @id
      `);
    return this.findById(id);
  },

  async delete(id: number | string): Promise<boolean> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, Number(id))
      .query('DELETE FROM [Address] WHERE id = @id');
    return (result.rowsAffected[0] ?? 0) > 0;
  },

  async findByUser(userEmail: string): Promise<Address[]> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('user_email', sql.NVarChar, userEmail)
      .query('SELECT * FROM [Address] WHERE user_email = @user_email');
    return result.recordset.map(rowToAddress);
  },

  async findById(id: number | string): Promise<Address | undefined> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, Number(id))
      .query('SELECT * FROM [Address] WHERE id = @id');
    if (result.recordset.length === 0) return undefined;
    return rowToAddress(result.recordset[0]);
  },

  /** setPrimary is a no-op since the DB has no is_primary column */
  async setPrimary(_id: number | string, _userEmail: string): Promise<boolean> {
    return true;
  },

  /** Class Diagram: validatePhoneNumber() */
  validatePhoneNumber(phone: string): boolean {
    return /^\d{11}$/.test(phone);
  },

  /** Class Diagram: validateUserInfo() */
  validateUserInfo(data: { phone?: string; building?: string; street?: string }): string | null {
    if (!data.phone || !this.validatePhoneNumber(data.phone)) {
      return 'Phone must be exactly 11 digits';
    }
    if (!data.building) return 'Building is required';
    if (!data.street) return 'Street is required';
    return null;
  },
};
