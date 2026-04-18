import Database from 'better-sqlite3';
import path from 'path';
import bcryptjs from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'foodies.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      email TEXT PRIMARY KEY,
      hashed_password TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK(loyalty_points >= 0)
    );

    CREATE TABLE IF NOT EXISTS Address (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      building_name TEXT NOT NULL,
      apartment TEXT NOT NULL,
      floor_number TEXT NOT NULL,
      street TEXT NOT NULL,
      nearby_landmark TEXT,
      FOREIGN KEY (user_email) REFERENCES User(email) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Restaurant (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 0,
      delivery_time INTEGER NOT NULL DEFAULT 30,
      delivery_price REAL NOT NULL DEFAULT 0,
      open_time TEXT NOT NULL DEFAULT '08:00',
      close_time TEXT NOT NULL DEFAULT '23:00',
      image_url TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS Menu_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      is_combo INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL DEFAULT 'Main',
      description TEXT DEFAULT '',
      FOREIGN KEY (restaurant_id) REFERENCES Restaurant(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_item_id INTEGER NOT NULL,
      discount_percentage REAL NOT NULL,
      original_price REAL NOT NULL,
      discounted_price REAL NOT NULL,
      starts_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (menu_item_id) REFERENCES Menu_item(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "Order" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      restaurant_id INTEGER NOT NULL,
      address_id INTEGER,
      sub_total REAL NOT NULL DEFAULT 0,
      delivery_price REAL NOT NULL DEFAULT 0,
      total_price REAL NOT NULL DEFAULT 0,
      points_redeemed INTEGER NOT NULL DEFAULT 0,
      order_status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      delivery_phone TEXT,
      delivery_building TEXT,
      delivery_apartment TEXT,
      delivery_floor TEXT,
      delivery_street TEXT,
      delivery_landmark TEXT,
      FOREIGN KEY (user_email) REFERENCES User(email),
      FOREIGN KEY (restaurant_id) REFERENCES Restaurant(id),
      FOREIGN KEY (address_id) REFERENCES Address(id)
    );

    CREATE TABLE IF NOT EXISTS Order_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES "Order"(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_item_id) REFERENCES Menu_item(id)
    );
  `);

  // Seed data if tables are empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM User').get() as { count: number };
  if (userCount.count === 0) {
    seedData(db);
  }
}

function seedData(db: Database.Database) {
  const adminPassword = bcryptjs.hashSync('Admin@123', 10);
  const userPassword = bcryptjs.hashSync('User@1234', 10);

  // Seed Users
  db.prepare(`INSERT INTO User (email, hashed_password, name, role, loyalty_points) VALUES (?, ?, ?, ?, ?)`).run('admin@foodies.com', adminPassword, 'Admin User', 'admin', 500);
  db.prepare(`INSERT INTO User (email, hashed_password, name, role, loyalty_points) VALUES (?, ?, ?, ?, ?)`).run('user@foodies.com', userPassword, 'Ahmed Hassan', 'user', 1200);

  // Seed Restaurants
  const restaurants = [
    { name: 'Burger Palace', rating: 4.5, delivery_time: 35, delivery_price: 15.00, open_time: '09:00', close_time: '23:00' },
    { name: 'Pizza House', rating: 4.2, delivery_time: 40, delivery_price: 20.00, open_time: '10:00', close_time: '00:00' },
    { name: 'Koshary El Tahrir', rating: 4.8, delivery_time: 25, delivery_price: 10.00, open_time: '08:00', close_time: '22:00' },
    { name: 'Shawarma Station', rating: 4.3, delivery_time: 30, delivery_price: 12.00, open_time: '11:00', close_time: '01:00' },
    { name: 'El Malem Grill', rating: 4.6, delivery_time: 45, delivery_price: 25.00, open_time: '12:00', close_time: '23:00' },
    { name: 'Sweet Tooth Bakery', rating: 4.1, delivery_time: 20, delivery_price: 8.00, open_time: '07:00', close_time: '21:00' },
  ];

  const insertRestaurant = db.prepare(`INSERT INTO Restaurant (name, rating, delivery_time, delivery_price, open_time, close_time) VALUES (?, ?, ?, ?, ?, ?)`);
  for (const r of restaurants) {
    insertRestaurant.run(r.name, r.rating, r.delivery_time, r.delivery_price, r.open_time, r.close_time);
  }

  // Seed Menu Items
  const menuItems = [
    // Burger Palace (id=1)
    { restaurant_id: 1, name: 'Classic Burger', price: 85, is_combo: 0, category: 'Burgers', description: 'Beef patty with lettuce, tomato and special sauce' },
    { restaurant_id: 1, name: 'Cheese Burger', price: 95, is_combo: 0, category: 'Burgers', description: 'Classic burger topped with cheddar cheese' },
    { restaurant_id: 1, name: 'Double Smash Burger', price: 130, is_combo: 0, category: 'Burgers', description: 'Two smashed beef patties with caramelized onions' },
    { restaurant_id: 1, name: 'Chicken Burger', price: 90, is_combo: 0, category: 'Burgers', description: 'Crispy chicken fillet with coleslaw' },
    { restaurant_id: 1, name: 'Burger Meal Combo', price: 145, is_combo: 1, category: 'Combos', description: 'Classic burger + fries + soft drink' },
    { restaurant_id: 1, name: 'French Fries', price: 35, is_combo: 0, category: 'Sides', description: 'Crispy golden fries' },
    { restaurant_id: 1, name: 'Onion Rings', price: 40, is_combo: 0, category: 'Sides', description: 'Crispy battered onion rings' },
    { restaurant_id: 1, name: 'Soft Drink', price: 20, is_combo: 0, category: 'Drinks', description: 'Pepsi, 7Up, or Mirinda' },

    // Pizza House (id=2)
    { restaurant_id: 2, name: 'Margherita Pizza', price: 110, is_combo: 0, category: 'Pizza', description: 'Classic tomato sauce with mozzarella' },
    { restaurant_id: 2, name: 'Pepperoni Pizza', price: 135, is_combo: 0, category: 'Pizza', description: 'Loaded with pepperoni and mozzarella' },
    { restaurant_id: 2, name: 'BBQ Chicken Pizza', price: 150, is_combo: 0, category: 'Pizza', description: 'BBQ sauce, grilled chicken, onions' },
    { restaurant_id: 2, name: 'Four Cheese Pizza', price: 140, is_combo: 0, category: 'Pizza', description: 'Mozzarella, cheddar, parmesan, gouda' },
    { restaurant_id: 2, name: 'Pizza Meal Deal', price: 180, is_combo: 1, category: 'Combos', description: 'Any pizza + garlic bread + drink' },
    { restaurant_id: 2, name: 'Garlic Bread', price: 45, is_combo: 0, category: 'Sides', description: 'Toasted garlic bread with butter' },
    { restaurant_id: 2, name: 'Caesar Salad', price: 55, is_combo: 0, category: 'Sides', description: 'Romaine lettuce with caesar dressing' },

    // Koshary El Tahrir (id=3)
    { restaurant_id: 3, name: 'Small Koshary', price: 25, is_combo: 0, category: 'Koshary', description: 'Traditional Egyptian koshary - small portion' },
    { restaurant_id: 3, name: 'Medium Koshary', price: 40, is_combo: 0, category: 'Koshary', description: 'Traditional Egyptian koshary - medium portion' },
    { restaurant_id: 3, name: 'Large Koshary', price: 55, is_combo: 0, category: 'Koshary', description: 'Traditional Egyptian koshary - large portion' },
    { restaurant_id: 3, name: 'Koshary with Extra Sauce', price: 60, is_combo: 0, category: 'Koshary', description: 'Large koshary with extra tomato sauce and vinegar' },
    { restaurant_id: 3, name: 'Koshary Meal', price: 70, is_combo: 1, category: 'Combos', description: 'Large koshary + drink + dessert' },

    // Shawarma Station (id=4)
    { restaurant_id: 4, name: 'Chicken Shawarma', price: 65, is_combo: 0, category: 'Shawarma', description: 'Marinated chicken shawarma wrap' },
    { restaurant_id: 4, name: 'Meat Shawarma', price: 80, is_combo: 0, category: 'Shawarma', description: 'Beef shawarma wrap with tahini' },
    { restaurant_id: 4, name: 'Shawarma Plate', price: 95, is_combo: 0, category: 'Plates', description: 'Shawarma served with rice and salad' },
    { restaurant_id: 4, name: 'Falafel Wrap', price: 45, is_combo: 0, category: 'Wraps', description: 'Crispy falafel with tahini and veggies' },
    { restaurant_id: 4, name: 'Shawarma Combo', price: 110, is_combo: 1, category: 'Combos', description: 'Shawarma wrap + fries + drink' },

    // El Malem Grill (id=5)
    { restaurant_id: 5, name: 'Mixed Grill Platter', price: 220, is_combo: 0, category: 'Grills', description: 'Kebab, kofta, and grilled chicken' },
    { restaurant_id: 5, name: 'Kofta Plate', price: 140, is_combo: 0, category: 'Grills', description: 'Grilled kofta with rice and salad' },
    { restaurant_id: 5, name: 'Grilled Chicken', price: 160, is_combo: 0, category: 'Grills', description: 'Half grilled chicken with sides' },
    { restaurant_id: 5, name: 'Kebab Plate', price: 180, is_combo: 0, category: 'Grills', description: 'Premium beef kebab with bread' },
    { restaurant_id: 5, name: 'Grill Family Combo', price: 350, is_combo: 1, category: 'Combos', description: 'Mixed grill for 4 + rice + salads + drinks' },

    // Sweet Tooth Bakery (id=6)
    { restaurant_id: 6, name: 'Chocolate Cake Slice', price: 55, is_combo: 0, category: 'Cakes', description: 'Rich chocolate cake slice' },
    { restaurant_id: 6, name: 'Kunafa', price: 70, is_combo: 0, category: 'Oriental', description: 'Traditional Egyptian kunafa with cream' },
    { restaurant_id: 6, name: 'Basbousa', price: 35, is_combo: 0, category: 'Oriental', description: 'Semolina cake soaked in syrup' },
    { restaurant_id: 6, name: 'Croissant', price: 30, is_combo: 0, category: 'Pastries', description: 'Butter croissant, plain or chocolate filled' },
    { restaurant_id: 6, name: 'Dessert Box', price: 120, is_combo: 1, category: 'Combos', description: 'Assorted mini desserts box' },
  ];

  const insertMenuItem = db.prepare(`INSERT INTO Menu_item (restaurant_id, name, price, is_combo, category, description) VALUES (?, ?, ?, ?, ?, ?)`);
  for (const item of menuItems) {
    insertMenuItem.run(item.restaurant_id, item.name, item.price, item.is_combo, item.category, item.description);
  }

  // Seed Offers (active offers)
  const now = new Date();
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const startStr = now.toISOString();
  const endStr = futureDate.toISOString();

  const offers = [
    { menu_item_id: 1, discount_percentage: 20, original_price: 85, discounted_price: 68 },
    { menu_item_id: 5, discount_percentage: 15, original_price: 145, discounted_price: 123.25 },
    { menu_item_id: 10, discount_percentage: 25, original_price: 135, discounted_price: 101.25 },
    { menu_item_id: 20, discount_percentage: 10, original_price: 70, discounted_price: 63 },
    { menu_item_id: 25, discount_percentage: 30, original_price: 110, discounted_price: 77 },
  ];

  const insertOffer = db.prepare(`INSERT INTO Offers (menu_item_id, discount_percentage, original_price, discounted_price, starts_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)`);
  for (const offer of offers) {
    insertOffer.run(offer.menu_item_id, offer.discount_percentage, offer.original_price, offer.discounted_price, startStr, endStr);
  }

  // Seed a sample address for the regular user
  db.prepare(`INSERT INTO Address (user_email, phone_number, building_name, apartment, floor_number, street, nearby_landmark) VALUES (?, ?, ?, ?, ?, ?, ?)`).run('user@foodies.com', '01234567890', 'Nile Tower', '12A', '5', 'Tahrir Street', 'Near Cairo University');
}
