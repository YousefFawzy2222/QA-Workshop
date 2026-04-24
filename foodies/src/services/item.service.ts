import { ItemStore, Item } from '../models/item.model';
import { RestaurantStore } from '../models/restaurant.model';

// ─── Result Types ─────────────────────────────────────────────────────────────
export interface ItemResult {
  success: boolean;
  item?: Item;
  items?: Item[];
  error?: string;
}

// ─── addItem (admin: Module 3.1) ─────────────────────────────────────────────
export async function addItem(data: {
  restaurantId: string;
  itemName: string;
  itemCost: number;
  itemQuantity: number;
  isCombo: boolean;
  itemSize: string;
  isOnDiscount: boolean;
  discountPercentage: number;
  description: string;
}): Promise<ItemResult> {
  // Restaurant must exist
  const restaurant = await RestaurantStore.findById(data.restaurantId);
  if (!restaurant) {
    return { success: false, error: `Restaurant with ID ${data.restaurantId} not found` };
  }

  // validateItem()
  const fieldError = ItemStore.validateItem({
    itemName:     data.itemName,
    itemCost:     data.itemCost,
    itemQuantity: data.itemQuantity,
    itemSize:     data.itemSize,
    description:  data.description,
    isCombo:      data.isCombo,
  });
  if (fieldError) return { success: false, error: fieldError };

  // Duplicate name check within the same restaurant
  const existing = await ItemStore.findByNameInRestaurant(data.restaurantId, data.itemName);
  if (existing) {
    return { success: false, error: 'An item with this name already exists in this restaurant' };
  }

  // validateItemOnDiscount()
  if (data.isOnDiscount) {
    const discountError = ItemStore.validateItemOnDiscount(data.discountPercentage);
    if (discountError) return { success: false, error: discountError };
  }

  const item = await ItemStore.add({
    restaurantId:      Number(data.restaurantId),
    itemName:          data.itemName.trim(),
    itemCost:          data.itemCost,
    itemQuantity:      data.itemQuantity,
    isCombo:           data.isCombo,
    itemSize:          data.itemSize.trim(),
    isOnDiscount:      data.isOnDiscount,
    discountPercentage: data.isOnDiscount ? data.discountPercentage : 0,
    description:       data.description.trim(),
  });

  return { success: true, item };
}

// ─── updateItem ───────────────────────────────────────────────────────────────
export async function updateItem(
  id: string,
  data: Partial<Omit<Item, 'id' | 'restaurantId'>>
): Promise<ItemResult> {
  const existing = await ItemStore.findById(id);
  if (!existing) return { success: false, error: 'Item not found' };

  // Re-validate merged data
  const merged = { ...existing, ...data };
  const fieldError = ItemStore.validateItem(merged);
  if (fieldError) return { success: false, error: fieldError };

  // Duplicate name check (allow same name for same item)
  if (data.itemName) {
    const duplicate = await ItemStore.findByNameInRestaurant(existing.restaurantId, data.itemName);
    if (duplicate && duplicate.id !== Number(id)) {
      return { success: false, error: 'An item with this name already exists in this restaurant' };
    }
  }

  // Re-validate discount if it's turned on
  if (merged.isOnDiscount) {
    const discountError = ItemStore.validateItemOnDiscount(merged.discountPercentage);
    if (discountError) return { success: false, error: discountError };
  }

  const item = await ItemStore.update(id, {
    ...data,
    itemName:    data.itemName?.trim(),
    itemSize:    data.itemSize?.trim(),
    description: data.description?.trim(),
    discountPercentage: merged.isOnDiscount ? merged.discountPercentage : 0,
  });

  return { success: true, item };
}

// ─── deleteItem ───────────────────────────────────────────────────────────────
export async function deleteItem(id: string): Promise<ItemResult> {
  const existing = await ItemStore.findById(id);
  if (!existing) return { success: false, error: 'Item not found' };
  await ItemStore.remove(id);
  return { success: true };
}

// ─── getItemsByRestaurant ─────────────────────────────────────────────────────
export async function getItemsByRestaurant(restaurantId: string): Promise<ItemResult> {
  const restaurant = await RestaurantStore.findById(restaurantId);
  if (!restaurant) return { success: false, error: 'Restaurant not found' };

  const items = await ItemStore.findByRestaurant(restaurantId);
  const enriched = items.map((item) => ({
    ...item,
    discountedPrice: ItemStore.getDiscountedPrice(item),
  }));

  return { success: true, items: enriched as Item[] };
}
