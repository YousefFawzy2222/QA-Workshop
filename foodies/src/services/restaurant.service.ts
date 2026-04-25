import { RestaurantStore, Restaurant } from '../models/restaurant.model';
import { ItemStore } from '../models/item.model';

// ─── Result Types ─────────────────────────────────────────────────────────────
export interface RestaurantResult {
  success: boolean;
  restaurant?: Restaurant;
  restaurants?: Restaurant[];
  error?: string;
}

// ─── Time Validation ─────────────────────────────────────────────────────────
function validateTimeFormat(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// ─── Field Validation ─────────────────────────────────────────────────────────
function validateRestaurantFields(data: {
  name?: string;
  location?: string;
  deliveryTime?: number;
  deliveryPrice?: number;
  openTime?: string;
  closeTime?: string;
}): string | null {
  if (!data.name || data.name.trim().length === 0) {
    return 'Restaurant name is required';
  }
  if (!data.location || data.location.trim().length === 0) {
    return 'Restaurant location is required';
  }
  if (data.deliveryPrice === undefined || data.deliveryPrice === null || isNaN(data.deliveryPrice)) {
    return 'Delivery price is required';
  }
  if (data.deliveryPrice < 0) {
    return 'Delivery price cannot be negative';
  }
  if (data.deliveryTime === undefined || isNaN(data.deliveryTime) || data.deliveryTime <= 0) {
    return 'Delivery time must be greater than 0';
  }
  if (!data.openTime || !validateTimeFormat(data.openTime)) {
    return 'Open time is required and must be in HH:MM format';
  }
  if (!data.closeTime || !validateTimeFormat(data.closeTime)) {
    return 'Close time is required and must be in HH:MM format';
  }
  if (timeToMinutes(data.closeTime) <= timeToMinutes(data.openTime)) {
    return 'Close time must be after open time';
  }
  return null;
}

// ─── addRestaurant ────────────────────────────────────────────────────────────
export async function addRestaurant(data: {
  name: string;
  location: string;
  deliveryTime: number;
  deliveryPrice: number;
  openTime: string;
  closeTime: string;
}): Promise<RestaurantResult> {
  const fieldError = validateRestaurantFields(data);
  if (fieldError) {
    return { success: false, error: fieldError };
  }

  const existing = await RestaurantStore.findByName(data.name);
  if (existing) {
    return { success: false, error: 'A restaurant with this name already exists' };
  }

  const restaurant = await RestaurantStore.add({
    name: data.name.trim(),
    location: data.location.trim(),
    deliveryPrice: data.deliveryPrice,
    deliveryTime: data.deliveryTime,
    openTime: data.openTime,
    closeTime: data.closeTime,
  });

  return { success: true, restaurant };
}

// ─── updateRestaurant ─────────────────────────────────────────────────────────
export async function updateRestaurant(
  id: string,
  data: {
    name?: string;
    location?: string;
    deliveryTime?: number;
    deliveryPrice?: number;
    openTime?: string;
    closeTime?: string;
  }
): Promise<RestaurantResult> {
  const existing = await RestaurantStore.findById(id);
  if (!existing) {
    return { success: false, error: 'Restaurant not found' };
  }

  const merged = { ...existing, ...data };
  const fieldError = validateRestaurantFields(merged);
  if (fieldError) {
    return { success: false, error: fieldError };
  }

  if (data.name) {
    const duplicate = await RestaurantStore.findByName(data.name);
    if (duplicate && duplicate.id !== Number(id)) {
      return { success: false, error: 'A restaurant with this name already exists' };
    }
  }

  const updated = await RestaurantStore.update(id, {
    ...data,
    name: data.name?.trim(),
    location: data.location?.trim(),
  });

  return { success: true, restaurant: updated };
}

// ─── deleteRestaurant ─────────────────────────────────────────────────────────
export async function deleteRestaurant(id: string): Promise<RestaurantResult> {
  const existing = await RestaurantStore.findById(id);
  if (!existing) {
    return { success: false, error: 'Restaurant not found' };
  }

  // Cascade: remove items (and their offers)
  await ItemStore.removeByRestaurant(id);

  // Remove restaurant
  await RestaurantStore.remove(id);

  return { success: true };
}

// ─── setOperatingHours ────────────────────────────────────────────────────────
export async function setOperatingHours(
  id: string,
  openTime: string,
  closeTime: string
): Promise<RestaurantResult> {
  const restaurant = await RestaurantStore.findById(id);
  if (!restaurant) {
    return { success: false, error: 'Restaurant not found' };
  }

  if (!validateTimeFormat(openTime) || !validateTimeFormat(closeTime)) {
    return { success: false, error: 'Times must be in HH:MM format' };
  }

  if (timeToMinutes(closeTime) <= timeToMinutes(openTime)) {
    return { success: false, error: 'Close time must be after open time' };
  }

  const updated = await RestaurantStore.update(id, { openTime, closeTime });

  return { success: true, restaurant: updated };
}

// ─── getAll ────────────────────────────────────────────────────────────────────
export async function getAllRestaurants(): Promise<RestaurantResult> {
  return { success: true, restaurants: await RestaurantStore.findAll() };
}
