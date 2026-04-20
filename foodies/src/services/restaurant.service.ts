import { RestaurantStore, Restaurant } from '../models/restaurant.model';
import { ItemStore } from '../models/item.model';

// ─── Result Types ─────────────────────────────────────────────────────────────
export interface RestaurantResult {
  success: boolean;
  restaurant?: Restaurant;
  restaurants?: Restaurant[];
  error?: string;
}

// ─── Field Validation ─────────────────────────────────────────────────────────
// Flowchart addRestaurant: "Fields Valid?" decision node

function validateRestaurantFields(data: {
  restName?: string;
  restLocation?: string;
  restDeliveryCost?: number;
  restMinDeliveryTime?: number;
  restMaxDeliveryTime?: number;
}): string | null {
  if (!data.restName || data.restName.trim().length === 0) {
    return 'Restaurant name is required';
  }
  if (!data.restLocation || data.restLocation.trim().length === 0) {
    return 'Restaurant location is required';
  }
  if (data.restDeliveryCost === undefined || data.restDeliveryCost === null || isNaN(data.restDeliveryCost)) {
    return 'Delivery cost is required';
  }
  if (data.restDeliveryCost < 0) {
    return 'Delivery cost cannot be negative';
  }
  if (data.restMinDeliveryTime === undefined || isNaN(data.restMinDeliveryTime) || data.restMinDeliveryTime <= 0) {
    return 'Minimum delivery time must be greater than 0';
  }
  if (data.restMaxDeliveryTime === undefined || isNaN(data.restMaxDeliveryTime) || data.restMaxDeliveryTime <= 0) {
    return 'Maximum delivery time must be greater than 0';
  }
  if (data.restMaxDeliveryTime <= data.restMinDeliveryTime) {
    return 'Maximum delivery time must be greater than minimum delivery time';
  }
  return null;
}

// ─── Time Validation ─────────────────────────────────────────────────────────
// Flowchart setOperatingHours: "Close > Open?" decision node

function validateTimeFormat(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// ─── addRestaurant ────────────────────────────────────────────────────────────
/**
 * Flowchart addRestaurant:
 * 1. Fill restaurant form
 * 2. Fields Valid? → No → show error (loop back)
 * 3. Restaurant already in DB? → Yes → show error (loop back)
 * 4. Save in Database → isOpen = false (default) → added to admin's list
 */
export function addRestaurant(data: {
  restName: string;
  restLocation: string;
  restDeliveryCost: number;
  restMinDeliveryTime: number;
  restMaxDeliveryTime: number;
}): RestaurantResult {
  // Step 2: Fields Valid?
  const fieldError = validateRestaurantFields(data);
  if (fieldError) {
    return { success: false, error: fieldError };
  }

  // Step 3: Restaurant already in DB?
  const existing = RestaurantStore.findByName(data.restName);
  if (existing) {
    return { success: false, error: 'A restaurant with this name already exists' };
  }

  // Step 4: Save in Database (isOpen = false by default in RestaurantStore.add)
  const restaurant = RestaurantStore.add({
    restName: data.restName.trim(),
    restLocation: data.restLocation.trim(),
    restDeliveryCost: data.restDeliveryCost,
    restMinDeliveryTime: data.restMinDeliveryTime,
    restMaxDeliveryTime: data.restMaxDeliveryTime,
    openTime: '',
    closeTime: '',
  });

  return { success: true, restaurant };
}

// ─── updateRestaurant ─────────────────────────────────────────────────────────
/**
 * Flowchart updateRestaurant:
 * 1. Edit the pre-filled restaurant form
 * 2. Changes Valid? → No → show error
 * 3. Save updates in Database → Restaurant updated in admin's list
 */
export function updateRestaurant(
  id: string,
  data: {
    restName?: string;
    restLocation?: string;
    restDeliveryCost?: number;
    restMinDeliveryTime?: number;
    restMaxDeliveryTime?: number;
  }
): RestaurantResult {
  // Check restaurant exists
  const existing = RestaurantStore.findById(id);
  if (!existing) {
    return { success: false, error: 'Restaurant not found' };
  }

  // Step 2: Changes Valid?
  const merged = { ...existing, ...data };
  const fieldError = validateRestaurantFields(merged);
  if (fieldError) {
    return { success: false, error: fieldError };
  }

  // Check for duplicate name (allow same name for same restaurant)
  if (data.restName) {
    const duplicate = RestaurantStore.findByName(data.restName);
    if (duplicate && duplicate.id !== id) {
      return { success: false, error: 'A restaurant with this name already exists' };
    }
  }

  // Step 3: Save updates
  const updated = RestaurantStore.update(id, {
    ...data,
    restName: data.restName?.trim(),
    restLocation: data.restLocation?.trim(),
  });

  return { success: true, restaurant: updated };
}

// ─── deleteRestaurant ─────────────────────────────────────────────────────────
/**
 * Flowchart deleteRestaurant:
 * 1. Delete restaurant option
 * 2. Confirm? → No → cancel
 * 3. Yes → Remove restaurant promotions → items → restaurant → Update admin's list
 *
 * Note: In-memory store has no promotions/items yet (future modules),
 * so we directly remove the restaurant (cascade is a no-op for now).
 */
export function deleteRestaurant(id: string): RestaurantResult {
  const existing = RestaurantStore.findById(id);
  if (!existing) {
    return { success: false, error: 'Restaurant not found' };
  }

  // Cascade: remove promotions (Module 2.2+), remove items (Module 3.1)
  // "Remove restaurant promotions from Database"
  // "Remove restaurant items from Database"
  ItemStore.removeByRestaurant(id);

  // "Remove restaurant from Database"
  RestaurantStore.remove(id);

  return { success: true };
}

// ─── setOperatingHours ────────────────────────────────────────────────────────
/**
 * Flowchart setOperatingHours:
 * 1. Select restaurant to set its hours
 * 2. Enter open/close times
 * 3. Close > Open? → No → show error
 * 4. Yes → Save schedule in Database
 */
export function setOperatingHours(
  id: string,
  openTime: string,
  closeTime: string
): RestaurantResult {
  // Find restaurant
  const restaurant = RestaurantStore.findById(id);
  if (!restaurant) {
    return { success: false, error: 'Restaurant not found' };
  }

  // Validate time format
  if (!validateTimeFormat(openTime) || !validateTimeFormat(closeTime)) {
    return { success: false, error: 'Times must be in HH:MM format' };
  }

  // Flowchart: "Close > Open?" — must be strictly after
  if (timeToMinutes(closeTime) <= timeToMinutes(openTime)) {
    return { success: false, error: 'Close time must be after open time' };
  }

  // Save schedule in Database
  const updated = RestaurantStore.update(id, { openTime, closeTime });

  return { success: true, restaurant: updated };
}

// ─── getAll ────────────────────────────────────────────────────────────────────
export function getAllRestaurants(): RestaurantResult {
  return { success: true, restaurants: RestaurantStore.findAll() };
}
