import { Request, Response } from 'express';
import {
  addItem,
  updateItem,
  deleteItem,
  getItemsByRestaurant,
} from '../services/item.service';

// ─── GET /api/admin/restaurants/:restaurantId/items ───────────────────────────
export function listItemsController(req: Request, res: Response): void {
  const { restaurantId } = req.params;
  const result = getItemsByRestaurant(restaurantId);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(404).json(result);
  }
}

// ─── POST /api/admin/restaurants/:restaurantId/items ──────────────────────────
// Module 3.1: Admin – Add Menu Item  (Class Diagram: Item.addItem())
export function addItemController(req: Request, res: Response): void {
  const { restaurantId } = req.params;
  const {
    itemName,
    itemCost,
    itemQuantity,
    isCombo,
    itemSize,
    isOnDiscount,
    discountPercentage,
    description,
  } = req.body;

  const result = addItem({
    restaurantId,
    itemName:           String(itemName || ''),
    itemCost:           Number(itemCost),
    itemQuantity:       Number(itemQuantity),
    isCombo:            Boolean(isCombo),
    itemSize:           String(itemSize || ''),
    isOnDiscount:       Boolean(isOnDiscount),
    discountPercentage: Number(discountPercentage) || 0,
    description:        String(description || ''),
  });

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
}

// ─── PUT /api/admin/restaurants/:restaurantId/items/:id ───────────────────────
export function updateItemController(req: Request, res: Response): void {
  const { id } = req.params;
  const {
    itemName,
    itemCost,
    itemQuantity,
    isCombo,
    itemSize,
    isOnDiscount,
    discountPercentage,
    description,
  } = req.body;

  const data: Record<string, unknown> = {};
  if (itemName           !== undefined) data.itemName           = String(itemName);
  if (itemCost           !== undefined) data.itemCost           = Number(itemCost);
  if (itemQuantity       !== undefined) data.itemQuantity       = Number(itemQuantity);
  if (isCombo            !== undefined) data.isCombo            = Boolean(isCombo);
  if (itemSize           !== undefined) data.itemSize           = String(itemSize);
  if (isOnDiscount       !== undefined) data.isOnDiscount       = Boolean(isOnDiscount);
  if (discountPercentage !== undefined) data.discountPercentage = Number(discountPercentage);
  if (description        !== undefined) data.description        = String(description);

  const result = updateItem(id, data as Parameters<typeof updateItem>[1]);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
}

// ─── DELETE /api/admin/restaurants/:restaurantId/items/:id ───────────────────
export function deleteItemController(req: Request, res: Response): void {
  const { id } = req.params;
  const result = deleteItem(id);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(404).json(result);
  }
}
