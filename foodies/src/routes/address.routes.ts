import { Router } from 'express';
import { getAddresses, addAddress, updateAddress, deleteAddress, setPrimary } from '../controllers/address.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getAddresses);
router.post('/', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/primary', setPrimary);

export default router;
