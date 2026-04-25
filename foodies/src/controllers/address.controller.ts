import { Request, Response } from 'express';
import { AddressStore } from '../models/address.model';

export async function getAddresses(req: Request, res: Response): Promise<void> {
  const userEmail = (req as any).userEmail;
  const addresses = await AddressStore.findByUser(userEmail);
  res.status(200).json({ success: true, addresses });
}

export async function addAddress(req: Request, res: Response): Promise<void> {
  const userEmail = (req as any).userEmail;
  const { phone, building, apartment, floor, street, landmark, isPrimary } = req.body;

  const validationError = AddressStore.validateUserInfo({ phone, building, street });
  if (validationError) {
    res.status(400).json({ success: false, error: validationError });
    return;
  }

  const newAddress = await AddressStore.add({
    userEmail,
    phone,
    building,
    apartment: apartment || '',
    floor: floor || '',
    street,
    landmark: landmark || '',
    isPrimary: isPrimary || false
  });

  res.status(201).json({ success: true, address: newAddress });
}

export async function updateAddress(req: Request, res: Response): Promise<void> {
  const userEmail = (req as any).userEmail;
  const id = req.params.id;
  const updates = req.body;

  const address = await AddressStore.findById(id);
  if (!address || address.userEmail !== userEmail) {
    res.status(404).json({ success: false, error: 'Address not found' });
    return;
  }

  if (updates.phone && !AddressStore.validatePhoneNumber(updates.phone)) {
    res.status(400).json({ success: false, error: 'Phone must be exactly 11 digits' });
    return;
  }

  const updatedAddress = await AddressStore.update(id, updates);
  res.status(200).json({ success: true, address: updatedAddress });
}

export async function deleteAddress(req: Request, res: Response): Promise<void> {
  const userEmail = (req as any).userEmail;
  const id = req.params.id;

  const address = await AddressStore.findById(id);
  if (!address || address.userEmail !== userEmail) {
    res.status(404).json({ success: false, error: 'Address not found' });
    return;
  }

  await AddressStore.delete(id);
  res.status(200).json({ success: true });
}

export async function setPrimary(req: Request, res: Response): Promise<void> {
  const userEmail = (req as any).userEmail;
  const id = req.params.id;

  const success = await AddressStore.setPrimary(id, userEmail);
  if (success) {
    res.status(200).json({ success: true });
  } else {
    res.status(404).json({ success: false, error: 'Address not found' });
  }
}
