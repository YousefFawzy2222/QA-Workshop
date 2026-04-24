import { Router } from 'express';
import { searchController } from '../controllers/search.controller';

const router = Router();

// GET /api/search?q=term&sort=rating
router.get('/', searchController);

export default router;
