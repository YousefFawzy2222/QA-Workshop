// ─── User Model — SQL Server ─────────────────────────────────────────────────
// Class Diagram: User
//   - email: String
//   - password: String
//   - userName: String
//   - isAdmin: boolean
// ERD: Email (PK), HashedPassword, Name, Role (user|admin), loyalty_points

import { getPool } from '../database';
import * as sql from 'mssql';

export interface User {
  email: string;
  passwordHash: string;
  userName: string;
  isAdmin: boolean;
  loyaltyPoints: number;
}

export const UserStore = {
  /** Find a user by email (case-insensitive) */
  async findByEmail(email: string): Promise<User | undefined> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email.trim().toLowerCase())
      .query('SELECT * FROM [User] WHERE LOWER(Email) = @email');
    if (result.recordset.length === 0) return undefined;
    const row = result.recordset[0];
    return {
      email: row.Email,
      passwordHash: row.HashedPassword,
      userName: row.Name,
      isAdmin: row.Role === 'admin',
      loyaltyPoints: row.loyalty_points,
    };
  },

  /** Add a new user */
  async add(user: { email: string; passwordHash: string; userName?: string; isAdmin: boolean }): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('email', sql.NVarChar, user.email.trim().toLowerCase())
      .input('password', sql.NVarChar, user.passwordHash)
      .input('name', sql.NVarChar, user.userName || '')
      .input('role', sql.NVarChar, user.isAdmin ? 'admin' : 'user')
      .input('points', sql.Int, 0)
      .query(
        'INSERT INTO [User] (Email, HashedPassword, Name, Role, loyalty_points) VALUES (@email, @password, @name, @role, @points)'
      );
  },

  /** Check if an email already exists */
  async emailExists(email: string): Promise<boolean> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email.trim().toLowerCase())
      .query('SELECT COUNT(*) as cnt FROM [User] WHERE LOWER(Email) = @email');
    return result.recordset[0].cnt > 0;
  },

  /** Update user name */
  async updateName(email: string, newName: string): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('email', sql.NVarChar, email.trim().toLowerCase())
      .input('name', sql.NVarChar, newName)
      .query('UPDATE [User] SET Name = @name WHERE LOWER(Email) = @email');
  },

  /** Update loyalty points */
  async updateLoyaltyPoints(email: string, points: number): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('email', sql.NVarChar, email.trim().toLowerCase())
      .input('points', sql.Int, points)
      .query('UPDATE [User] SET loyalty_points = @points WHERE LOWER(Email) = @email');
  },

  /** Add loyalty points (increment) */
  async addLoyaltyPoints(email: string, pointsToAdd: number): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('email', sql.NVarChar, email.trim().toLowerCase())
      .input('points', sql.Int, pointsToAdd)
      .query('UPDATE [User] SET loyalty_points = loyalty_points + @points WHERE LOWER(Email) = @email');
  },

  /** Deduct loyalty points */
  async deductLoyaltyPoints(email: string, pointsToDeduct: number): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('email', sql.NVarChar, email.trim().toLowerCase())
      .input('points', sql.Int, pointsToDeduct)
      .query('UPDATE [User] SET loyalty_points = loyalty_points - @points WHERE LOWER(Email) = @email');
  },
};
