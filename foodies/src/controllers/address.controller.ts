import { Request, Response } from 'express';
import { AddressStore } from '../models/address.model';

function validatePhone(phone: string): boolean {
  return /^\d{11}$/.test(phone);
}

export function getAddresses(req: Request, res: Response): void {
  const userEmail = (req as any).userEmail;
  const addresses = AddressStore.findByUser(userEmail);
  res.status(200).json({ success: true, addresses });
}

export function addAddress(req: Request, res: Response): void {
  const userEmail = (req as any).userEmail;
  const { phone, building, apartment, floor, street, landmark, isPrimary } = req.body;

  if (!phone || !validatePhone(phone)) {
    res.status(400).json({ success: false, error: 'Phone must be exactly 11 digits' });
    return;
  }

  if (!building || !street) {
    res.status(400).json({ success: false, error: 'Building and street are required' });
    return;
  }

  const newAddress = AddressStore.add({
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

export function updateAddress(req: Request, res: Response): void {
  const userEmail = (req as any).userEmail;
  const id = req.params.id;
  const updates = req.body;

  const address = AddressStore.findById(id);
  if (!address || address.userEmail !== userEmail) {
    res.status(404).json({ success: false, error: 'Address not found' });
    return;
  }

  if (updates.phone && !validatePhone(updates.phone)) {
    res.status(400).json({ success: false, error: 'Phone must be exactly 11 digits' });
    return;
  }

  const updatedAddress = AddressStore.update(id, updates);
  res.status(200).json({ success: true, address: updatedAddress });
}

export function deleteAddress(req: Request, res: Response): void {
  const userEmail = (req as any).userEmail;
  const id = req.params.id;

  const address = AddressStore.findById(id);
  if (!address || address.userEmail !== userEmail) {
    res.status(404).json({ success: false, error: 'Address not found' });
    return;
  }

  AddressStore.delete(id);
  res.status(200).json({ success: true });
}

export function setPrimary(req: Request, res: Response): void {
  const userEmail = (req as any).userEmail;
  const id = req.params.id;

  const success = AddressStore.setPrimary(id, userEmail);
  if (success) {
    res.status(200).json({ success: true });
  } else {
    res.status(404).json({ success: false, error: 'Address not found' });
  }
}
