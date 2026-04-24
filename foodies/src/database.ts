import * as sql from 'mssql';

// ─── SQL Server Connection ───────────────────────────────────────────────────
const config: sql.config = {
  server: 'db49145.public.databaseasp.net',
  database: 'db49145',
  user: 'db49145',
  password: 'Ts4!3_nK%S7p',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

/**
 * Returns a connected SQL Server connection pool (singleton).
 */
export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect();
    console.log('  ✅  Connected to SQL Server');
  }
  return pool;
}

/**
 * Close the connection pool (for graceful shutdown).
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}
