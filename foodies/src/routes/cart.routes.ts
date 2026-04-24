import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getCartController,
  addToCartController,
  removeFromCartController,
  updateCartQuantityController,
  clearCartController,
} from '../controllers/cart.controller';

const router = Router();

router.use(requireAuth);

// GET    /api/cart
router.get('/', getCartController);

// POST   /api/cart/add
router.post('/add', addToCartController);

// DELETE /api/cart/:menuItemId
router.delete('/:menuItemId', removeFromCartController);

// PUT    /api/cart/:menuItemId
router.put('/:menuItemId', updateCartQuantityController);

// DELETE /api/cart (clear)
router.delete('/', clearCartController);

export default router;
