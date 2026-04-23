import { Router } from 'express';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  listRestaurantsController,
  addRestaurantController,
  updateRestaurantController,
  deleteRestaurantController,
  setOperatingHoursController,
} from '../controllers/restaurant.controller';

const router = Router();

// All routes below are protected by the admin guard
// Flowchart: every admin action checks isAdmin == true first

// GET  /api/admin/restaurants         – list all restaurants
router.get('/', requireAdmin, listRestaurantsController);

// POST /api/admin/restaurants         – addRestaurant()
router.post('/', requireAdmin, addRestaurantController);

// PUT  /api/admin/restaurants/:id     – updateRestaurant()
router.put('/:id', requireAdmin, updateRestaurantController);

// DELETE /api/admin/restaurants/:id   – deleteRestaurant()
router.delete('/:id', requireAdmin, deleteRestaurantController);

// PATCH /api/admin/restaurants/:id/hours – setOperatingHours()
router.patch('/:id/hours', requireAdmin, setOperatingHoursController);

export default router;
