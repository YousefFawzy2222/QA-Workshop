import { getPool } from './database';

/**
 * Creates all tables matching the ERD if they don't already exist.
 */
export async function initializeDatabase(): Promise<void> {
  const pool = await getPool();

  // ─── User Table ──────────────────────────────────────────────────────────────
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'User')
    BEGIN
      CREATE TABLE [User] (
        Email         NVARCHAR(255)  NOT NULL PRIMARY KEY,
        HashedPassword NVARCHAR(255) NOT NULL,
        Name          NVARCHAR(255)  NOT NULL DEFAULT '',
        Role          NVARCHAR(50)   NOT NULL DEFAULT 'user',
        loyalty_points INT           NOT NULL DEFAULT 0
      );
    END
  `);

  // ─── Address Table ───────────────────────────────────────────────────────────
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Address')
    BEGIN
      CREATE TABLE [Address] (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        user_email      NVARCHAR(255)     NOT NULL,
        phone_number    NVARCHAR(11)      NOT NULL,
        building_name   NVARCHAR(255)     NOT NULL,
        apartment       NVARCHAR(255)     NOT NULL DEFAULT '',
        floor_number    NVARCHAR(50)      NOT NULL DEFAULT '',
        street          NVARCHAR(255)     NOT NULL,
        nearby_landmark NVARCHAR(255)     NULL,
        FOREIGN KEY (user_email) REFERENCES [User](Email)
      );
    END
  `);

  // ─── Address Migrations (Ensure columns exist) ──────────────────────────────
  await pool.request().query(`
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Address')
    BEGIN
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Address' AND COLUMN_NAME = 'phone_number')
        ALTER TABLE [Address] ADD phone_number NVARCHAR(11) NOT NULL DEFAULT '';
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Address' AND COLUMN_NAME = 'building')
        ALTER TABLE [Address] ADD building NVARCHAR(255) NOT NULL DEFAULT '';
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Address' AND COLUMN_NAME = 'apartment')
        ALTER TABLE [Address] ADD apartment NVARCHAR(255) NOT NULL DEFAULT '';
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Address' AND COLUMN_NAME = 'floor_number')
        ALTER TABLE [Address] ADD floor_number NVARCHAR(50) NOT NULL DEFAULT '';
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Address' AND COLUMN_NAME = 'street')
        ALTER TABLE [Address] ADD street NVARCHAR(255) NOT NULL DEFAULT '';
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Address' AND COLUMN_NAME = 'nearby_landmark')
        ALTER TABLE [Address] ADD nearby_landmark NVARCHAR(255) NULL;
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Address' AND COLUMN_NAME = 'is_primary')
        ALTER TABLE [Address] ADD is_primary BIT NOT NULL DEFAULT 0;
    END
  `);

  // ─── Restaurant Table ────────────────────────────────────────────────────────
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Restaurant')
    BEGIN
      CREATE TABLE [Restaurant] (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        name            NVARCHAR(255)     NOT NULL,
        rating          FLOAT             NOT NULL DEFAULT 0,
        delivery_time   INT               NOT NULL DEFAULT 30,
        min_delivery_time INT             NOT NULL DEFAULT 15,
        max_delivery_time INT             NOT NULL DEFAULT 60,
        delivery_price  FLOAT             NOT NULL DEFAULT 0,
        location        NVARCHAR(255)     NOT NULL DEFAULT '',
        open_time       NVARCHAR(10)      NOT NULL DEFAULT '',
        close_time      NVARCHAR(10)      NOT NULL DEFAULT ''
      );
    END
  `);

  // ─── Migrations (Ensure columns exist) ───────────────────────────────────────
  await pool.request().query(`
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Restaurant')
    BEGIN
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Restaurant' AND COLUMN_NAME = 'delivery_time')
        ALTER TABLE [Restaurant] ADD delivery_time INT NOT NULL DEFAULT 30;
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Restaurant' AND COLUMN_NAME = 'min_delivery_time')
        ALTER TABLE [Restaurant] ADD min_delivery_time INT NOT NULL DEFAULT 15;
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Restaurant' AND COLUMN_NAME = 'max_delivery_time')
        ALTER TABLE [Restaurant] ADD max_delivery_time INT NOT NULL DEFAULT 60;
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Restaurant' AND COLUMN_NAME = 'delivery_price')
        ALTER TABLE [Restaurant] ADD delivery_price FLOAT NOT NULL DEFAULT 0;
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Restaurant' AND COLUMN_NAME = 'location')
        ALTER TABLE [Restaurant] ADD location NVARCHAR(255) NOT NULL DEFAULT '';
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Restaurant' AND COLUMN_NAME = 'open_time')
        ALTER TABLE [Restaurant] ADD open_time NVARCHAR(10) NOT NULL DEFAULT '';
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Restaurant' AND COLUMN_NAME = 'close_time')
        ALTER TABLE [Restaurant] ADD close_time NVARCHAR(10) NOT NULL DEFAULT '';
    END
  `);

  // ─── Menu_item Table ─────────────────────────────────────────────────────────
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Menu_item')
    BEGIN
      CREATE TABLE [Menu_item] (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        restaurant_id   INT               NOT NULL,
        name            NVARCHAR(255)     NOT NULL,
        price           FLOAT             NOT NULL DEFAULT 0,
        is_combo        BIT               NOT NULL DEFAULT 0,
        item_size       NVARCHAR(50)      NOT NULL DEFAULT 'Regular',
        item_quantity   INT               NOT NULL DEFAULT 0,
        description     NVARCHAR(500)     NOT NULL DEFAULT '',
        is_on_discount  BIT               NOT NULL DEFAULT 0,
        discount_percentage FLOAT         NOT NULL DEFAULT 0,
        FOREIGN KEY (restaurant_id) REFERENCES [Restaurant](id)
      );
    END
  `);

  // ─── Menu_item Migrations (Ensure columns exist) ─────────────────────────────
  await pool.request().query(`
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Menu_item')
    BEGIN
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Menu_item' AND COLUMN_NAME = 'price')
        ALTER TABLE [Menu_item] ADD price FLOAT NOT NULL DEFAULT 0;
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Menu_item' AND COLUMN_NAME = 'is_combo')
        ALTER TABLE [Menu_item] ADD is_combo BIT NOT NULL DEFAULT 0;
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Menu_item' AND COLUMN_NAME = 'item_size')
        ALTER TABLE [Menu_item] ADD item_size NVARCHAR(50) NOT NULL DEFAULT 'Regular';
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Menu_item' AND COLUMN_NAME = 'item_quantity')
        ALTER TABLE [Menu_item] ADD item_quantity INT NOT NULL DEFAULT 0;
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Menu_item' AND COLUMN_NAME = 'description')
        ALTER TABLE [Menu_item] ADD description NVARCHAR(500) NOT NULL DEFAULT '';
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Menu_item' AND COLUMN_NAME = 'is_on_discount')
        ALTER TABLE [Menu_item] ADD is_on_discount BIT NOT NULL DEFAULT 0;
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Menu_item' AND COLUMN_NAME = 'discount_percentage')
        ALTER TABLE [Menu_item] ADD discount_percentage FLOAT NOT NULL DEFAULT 0;
    END
  `);

  // ─── Offers Table ────────────────────────────────────────────────────────────
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Offers')
    BEGIN
      CREATE TABLE [Offers] (
        id                  INT IDENTITY(1,1) PRIMARY KEY,
        menu_item_id        INT               NOT NULL,
        discount_percentage FLOAT             NOT NULL DEFAULT 0,
        original_price      FLOAT             NOT NULL DEFAULT 0,
        discounted_price    FLOAT             NOT NULL DEFAULT 0,
        offer_name          NVARCHAR(255)     NOT NULL DEFAULT '',
        starts_at           NVARCHAR(50)      NOT NULL DEFAULT '',
        expires_at          NVARCHAR(50)      NOT NULL DEFAULT '',
        FOREIGN KEY (menu_item_id) REFERENCES [Menu_item](id)
      );
    END
  `);

  // ─── Order Table ─────────────────────────────────────────────────────────────
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Order')
    BEGIN
      CREATE TABLE [Order] (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        user_email      NVARCHAR(255)     NOT NULL,
        restaurant_id   INT               NOT NULL,
        address_id      INT               NULL,
        sub_total       FLOAT             NOT NULL DEFAULT 0,
        delivery_price  FLOAT             NOT NULL DEFAULT 0,
        total_price     FLOAT             NOT NULL DEFAULT 0,
        points_redeemed INT               NOT NULL DEFAULT 0,
        points_earned   INT               NOT NULL DEFAULT 0,
        order_status    NVARCHAR(50)      NOT NULL DEFAULT 'placed',
        payment_method  NVARCHAR(50)      NOT NULL DEFAULT 'COD',
        created_at      NVARCHAR(50)      NOT NULL DEFAULT '',
        FOREIGN KEY (user_email)    REFERENCES [User](Email),
        FOREIGN KEY (restaurant_id) REFERENCES [Restaurant](id),
        FOREIGN KEY (address_id)    REFERENCES [Address](id)
      );
    END
  `);

  // ─── Order_item Table ────────────────────────────────────────────────────────
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Order_item')
    BEGIN
      CREATE TABLE [Order_item] (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        order_id        INT               NOT NULL,
        menu_item_id    INT               NOT NULL,
        quantity        INT               NOT NULL DEFAULT 1,
        unit_price      FLOAT             NOT NULL DEFAULT 0,
        FOREIGN KEY (order_id)     REFERENCES [Order](id),
        FOREIGN KEY (menu_item_id) REFERENCES [Menu_item](id)
      );
    END
  `);

  console.log('  📦  Database tables initialized');
}
