import { Request, Response } from 'express';
import { placeOrder, getUserOrders, getOrderDetails } from '../services/checkout.service';

export async function checkoutController(req: Request, res: Response): Promise<void> {
  const userEmail = (req as any).userEmail;
  const { addressId, usePoints, pointsToRedeem } = req.body;

  const result = await placeOrder(
    userEmail,
    addressId ? Number(addressId) : null,
    Boolean(usePoints),
    Number(pointsToRedeem) || 0
  );

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
}

export async function listOrdersController(req: Request, res: Response): Promise<void> {
  const userEmail = (req as any).userEmail;
  const result = await getUserOrders(userEmail);
  res.status(200).json(result);
}

export async function getOrderController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await getOrderDetails(id);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(404).json(result);
  }
}
