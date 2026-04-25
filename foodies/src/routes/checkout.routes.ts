import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  checkoutController,
  listOrdersController,
  getOrderController,
} from '../controllers/checkout.controller';

const router = Router();

router.use(requireAuth);

// POST /api/checkout          – place order
router.post('/', checkoutController);

// GET  /api/orders            – list user orders
router.get('/orders', listOrdersController);

// GET  /api/orders/:id        – get order details
router.get('/orders/:id', getOrderController);

export default router;
