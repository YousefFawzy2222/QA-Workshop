import { Request, Response } from 'express';
import { createOffer, updateOffer, deleteOffer, getAllOffers, getActiveOffers } from '../services/offer.service';

export async function listOffersController(_req: Request, res: Response): Promise<void> {
  const result = await getAllOffers();
  res.status(200).json(result);
}

export async function listActiveOffersController(_req: Request, res: Response): Promise<void> {
  const result = await getActiveOffers();
  res.status(200).json(result);
}

export async function createOfferController(req: Request, res: Response): Promise<void> {
  const { menuItemId, discountPercentage, offerName, startsAt, expiresAt } = req.body;

  const result = await createOffer({
    menuItemId: Number(menuItemId),
    discountPercentage: Number(discountPercentage),
    offerName: String(offerName || ''),
    startsAt: String(startsAt || ''),
    expiresAt: String(expiresAt || ''),
  });

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
}

export async function updateOfferController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { discountPercentage, offerName, startsAt, expiresAt } = req.body;

  const data: any = {};
  if (discountPercentage !== undefined) data.discountPercentage = Number(discountPercentage);
  if (offerName !== undefined) data.offerName = String(offerName);
  if (startsAt !== undefined) data.startsAt = String(startsAt);
  if (expiresAt !== undefined) data.expiresAt = String(expiresAt);

  const result = await updateOffer(id, data);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
}

export async function deleteOfferController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await deleteOffer(id);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(404).json(result);
  }
}
