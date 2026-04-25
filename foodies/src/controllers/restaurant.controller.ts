import { Request, Response } from 'express';
import {
  addRestaurant,
  updateRestaurant,
  deleteRestaurant,
  setOperatingHours,
  getAllRestaurants,
} from '../services/restaurant.service';

// ─── GET /api/admin/restaurants ───────────────────────────────────────────────
export async function listRestaurantsController(_req: Request, res: Response): Promise<void> {
  const result = await getAllRestaurants();
  res.status(200).json(result);
}

// ─── POST /api/admin/restaurants ─────────────────────────────────────────────
export async function addRestaurantController(req: Request, res: Response): Promise<void> {
  const { name, location, deliveryTime, deliveryPrice, openTime, closeTime } =
    req.body as {
      name: string;
      location: string;
      deliveryTime: number;
      deliveryPrice: number;
      openTime: string;
      closeTime: string;
    };

  const result = await addRestaurant({
    name,
    location,
    deliveryTime: Number(deliveryTime),
    deliveryPrice: Number(deliveryPrice),
    openTime,
    closeTime,
  });

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
}

// ─── PUT /api/admin/restaurants/:id ──────────────────────────────────────────
export async function updateRestaurantController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { name, location, deliveryTime, deliveryPrice, openTime, closeTime } =
    req.body as {
      name?: string;
      location?: string;
      deliveryTime?: number;
      deliveryPrice?: number;
      openTime?: string;
      closeTime?: string;
    };

  const result = await updateRestaurant(id, {
    ...(name !== undefined && { name }),
    ...(location !== undefined && { location }),
    ...(deliveryTime !== undefined && { deliveryTime: Number(deliveryTime) }),
    ...(deliveryPrice !== undefined && { deliveryPrice: Number(deliveryPrice) }),
    ...(openTime !== undefined && { openTime }),
    ...(closeTime !== undefined && { closeTime }),
  });

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
}

// ─── DELETE /api/admin/restaurants/:id ───────────────────────────────────────
export async function deleteRestaurantController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await deleteRestaurant(id);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(404).json(result);
  }
}

// ─── PATCH /api/admin/restaurants/:id/hours ───────────────────────────────────
export async function setOperatingHoursController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { openTime, closeTime } = req.body as { openTime: string; closeTime: string };

  const result = await setOperatingHours(id, openTime, closeTime);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
}
