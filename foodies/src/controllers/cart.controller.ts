import { Request, Response } from 'express';
import { addToCart, removeFromCart, updateCartQuantity, getCart, clearCart } from '../services/cart.service';

export async function getCartController(req: Request, res: Response): Promise<void> {
  const userEmail = (req as any).userEmail;
  const result = getCart(userEmail);
  res.status(200).json(result);
}

export async function addToCartController(req: Request, res: Response): Promise<void> {
  const userEmail = (req as any).userEmail;
  const { menuItemId, quantity } = req.body;

  const result = await addToCart(userEmail, Number(menuItemId), Number(quantity) || 1);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
}

export async function removeFromCartController(req: Request, res: Response): Promise<void> {
  const userEmail = (req as any).userEmail;
  const { menuItemId } = req.params;

  const result = removeFromCart(userEmail, Number(menuItemId));
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(404).json(result);
  }
}

export async function updateCartQuantityController(req: Request, res: Response): Promise<void> {
  const userEmail = (req as any).userEmail;
  const { menuItemId } = req.params;
  const { quantity } = req.body;

  const result = updateCartQuantity(userEmail, Number(menuItemId), Number(quantity));
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
}

export async function clearCartController(req: Request, res: Response): Promise<void> {
  const userEmail = (req as any).userEmail;
  const result = clearCart(userEmail);
  res.status(200).json(result);
}
