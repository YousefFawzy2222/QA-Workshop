// ─── In-Memory Restaurant Store ───────────────────────────────────────────────
// Class Diagram: Restaurant
//   - restName: String
//   - restRate: float
//   - restMaxDeliveryTime: float
//   - restMinDeliveryTime: float
//   - restDeliveryCost: float
//   - restLocation: String
//   - openTime: String
//   - closeTime: String
//   - isOpen: boolean
//   + checkOperatingStatus(): boolean

export interface Restaurant {
  id: string;                    // unique identifier (generated)
  restName: string;
  restRate: number;              // default 0.0 on creation (no ratings yet)
  restMaxDeliveryTime: number;   // minutes
  restMinDeliveryTime: number;   // minutes
  restDeliveryCost: number;      // EGP
  restLocation: string;
  openTime: string;              // "HH:MM" 24h format
  closeTime: string;             // "HH:MM" 24h format
  isOpen: boolean;               // false by default per flowchart
}

// Singleton in-memory store (resets on server restart – no DB for this phase)
const restaurants: Restaurant[] = [];

// Seed one admin user for demo purposes (mirrors auth.service bootstrap logic)
// We also seed an admin user at startup so testers can log in immediately.
import { UserStore } from './user.model';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  if (!UserStore.emailExists('admin@foodies.com')) {
    const hash = await bcrypt.hash('Admin@123', 10);
    UserStore.add({ email: 'admin@foodies.com', passwordHash: hash, isAdmin: true });
    console.log('  🔑  Admin seeded → admin@foodies.com / Admin@123');
  }
}
seedAdmin();

let nextId = 1;

export const RestaurantStore = {
  /** Return all restaurants */
  findAll(): Restaurant[] {
    return [...restaurants];
  },

  /** Find by id */
  findById(id: string): Restaurant | undefined {
    return restaurants.find((r) => r.id === id);
  },

  /** Find by name (case-insensitive) */
  findByName(name: string): Restaurant | undefined {
    return restaurants.find(
      (r) => r.restName.toLowerCase() === name.trim().toLowerCase()
    );
  },

  /** Add a new restaurant — isOpen defaults to false (flowchart) */
  add(data: Omit<Restaurant, 'id' | 'isOpen' | 'restRate'>): Restaurant {
    const restaurant: Restaurant = {
      id: String(nextId++),
      restRate: 0,
      isOpen: false,          // flowchart: "isOpen = false (default)"
      ...data,
    };
    restaurants.push(restaurant);
    return restaurant;
  },

  /** Update fields on an existing restaurant */
  update(id: string, data: Partial<Omit<Restaurant, 'id'>>): Restaurant | undefined {
    const idx = restaurants.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    restaurants[idx] = { ...restaurants[idx], ...data };
    return restaurants[idx];
  },

  /** Remove a restaurant (and its promotions/items in a real DB cascade) */
  remove(id: string): boolean {
    const idx = restaurants.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    restaurants.splice(idx, 1);
    return true;
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
