import { Request, Response } from 'express';
import {
  addRestaurant,
  updateRestaurant,
  deleteRestaurant,
  setOperatingHours,
  getAllRestaurants,
} from '../services/restaurant.service';

// ─── GET /api/admin/restaurants ───────────────────────────────────────────────
export function listRestaurantsController(_req: Request, res: Response): void {
  const result = getAllRestaurants();
  res.status(200).json(result);
}

// ─── POST /api/admin/restaurants ─────────────────────────────────────────────
// Admin flowchart: addRestaurant()
export function addRestaurantController(req: Request, res: Response): void {
  const { restName, restLocation, restDeliveryCost, restMinDeliveryTime, restMaxDeliveryTime } =
    req.body as {
      restName: string;
      restLocation: string;
      restDeliveryCost: number;
      restMinDeliveryTime: number;
      restMaxDeliveryTime: number;
    };

  const result = addRestaurant({
    restName,
    restLocation,
    restDeliveryCost: Number(restDeliveryCost),
    restMinDeliveryTime: Number(restMinDeliveryTime),
    restMaxDeliveryTime: Number(restMaxDeliveryTime),
  });

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
}

// ─── PUT /api/admin/restaurants/:id ──────────────────────────────────────────
// Admin flowchart: updateRestaurant()
export function updateRestaurantController(req: Request, res: Response): void {
  const { id } = req.params;
  const { restName, restLocation, restDeliveryCost, restMinDeliveryTime, restMaxDeliveryTime } =
    req.body as {
      restName?: string;
      restLocation?: string;
      restDeliveryCost?: number;
      restMinDeliveryTime?: number;
      restMaxDeliveryTime?: number;
    };

  const result = updateRestaurant(id, {
    ...(restName !== undefined && { restName }),
    ...(restLocation !== undefined && { restLocation }),
    ...(restDeliveryCost !== undefined && { restDeliveryCost: Number(restDeliveryCost) }),
    ...(restMinDeliveryTime !== undefined && { restMinDeliveryTime: Number(restMinDeliveryTime) }),
    ...(restMaxDeliveryTime !== undefined && { restMaxDeliveryTime: Number(restMaxDeliveryTime) }),
  });

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
}

// ─── DELETE /api/admin/restaurants/:id ───────────────────────────────────────
// Admin flowchart: deleteRestaurant()
export function deleteRestaurantController(req: Request, res: Response): void {
  const { id } = req.params;
  const result = deleteRestaurant(id);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(404).json(result);
  }
}

// ─── PATCH /api/admin/restaurants/:id/hours ───────────────────────────────────
// Admin flowchart: setOperatingHours()
export function setOperatingHoursController(req: Request, res: Response): void {
  const { id } = req.params;
  const { openTime, closeTime } = req.body as { openTime: string; closeTime: string };

  const result = setOperatingHours(id, openTime, closeTime);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
}
