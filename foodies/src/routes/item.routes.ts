import { Router } from 'express';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  listItemsController,
  addItemController,
  updateItemController,
  deleteItemController,
} from '../controllers/item.controller';

// Mounted at /api/admin/restaurants/:restaurantId/items
const router = Router({ mergeParams: true });

// All routes require admin guard (isAdmin == true check)
// GET    /api/admin/restaurants/:restaurantId/items
router.get('/', requireAdmin, listItemsController);

// POST   /api/admin/restaurants/:restaurantId/items
router.post('/', requireAdmin, addItemController);

// PUT    /api/admin/restaurants/:restaurantId/items/:id
router.put('/:id', requireAdmin, updateItemController);

// DELETE /api/admin/restaurants/:restaurantId/items/:id
router.delete('/:id', requireAdmin, deleteItemController);

export default router;
