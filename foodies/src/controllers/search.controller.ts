import { Request, Response } from 'express';
import { searchRestaurants } from '../services/search.service';

export async function searchController(req: Request, res: Response): Promise<void> {
  const { q, sort } = req.query;

  const result = await searchRestaurants(
    String(q || ''),
    sort ? String(sort) : undefined
  );

  res.status(200).json(result);
}
