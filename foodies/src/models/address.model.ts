import { randomUUID } from 'crypto';

export interface Address {
  id: string;
  userEmail: string;
  phone: string;
  building: string;
  apartment: string;
  floor: string;
  street: string;
  landmark: string;
  isPrimary: boolean;
}

const addresses: Address[] = [];

export const AddressStore = {
  add(address: Omit<Address, 'id'>): Address {
    const newAddress = { ...address, id: randomUUID() };
    
    // If it's the first address for the user, make it primary automatically
    const userAddresses = this.findByUser(address.userEmail);
    if (userAddresses.length === 0) {
      newAddress.isPrimary = true;
    }

    // If setting as primary, unset others
    if (newAddress.isPrimary) {
      this.unsetPrimary(address.userEmail);
    }
    
    addresses.push(newAddress);
    return newAddress;
  },

  update(id: string, updates: Partial<Omit<Address, 'id' | 'userEmail'>>): Address | undefined {
    const index = addresses.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    if (updates.isPrimary) {
      this.unsetPrimary(addresses[index].userEmail);
    }

    addresses[index] = { ...addresses[index], ...updates };
    return addresses[index];
  },

  delete(id: string): boolean {
    const index = addresses.findIndex(a => a.id === id);
    if (index === -1) return false;
    addresses.splice(index, 1);
    return true;
  },

  findByUser(userEmail: string): Address[] {
    return addresses.filter(a => a.userEmail === userEmail);
  },

  findById(id: string): Address | undefined {
    return addresses.find(a => a.id === id);
  },

  unsetPrimary(userEmail: string) {
    addresses.forEach(a => {
      if (a.userEmail === userEmail) {
        a.isPrimary = false;
      }
    });
  },
  
  setPrimary(id: string, userEmail: string): boolean {
    const address = this.findById(id);
    if (!address || address.userEmail !== userEmail) return false;
    
    this.unsetPrimary(userEmail);
    address.isPrimary = true;
    return true;
  }
};
