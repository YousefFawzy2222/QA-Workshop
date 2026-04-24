import { Router } from 'express';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  listOffersController,
  listActiveOffersController,
  createOfferController,
  updateOfferController,
  deleteOfferController,
} from '../controllers/offer.controller';

const router = Router();

// GET  /api/offers          – list all active offers (public)
router.get('/active', listActiveOffersController);

// GET  /api/admin/offers    – list all offers (admin)
router.get('/', requireAdmin, listOffersController);

// POST /api/admin/offers    – createPromotion()
router.post('/', requireAdmin, createOfferController);

// PUT  /api/admin/offers/:id – editPromotion()
router.put('/:id', requireAdmin, updateOfferController);

// DELETE /api/admin/offers/:id
router.delete('/:id', requireAdmin, deleteOfferController);

export default router;
