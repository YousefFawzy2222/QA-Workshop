'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

interface Address {
  id?: number;
  phone_number: string;
  building_name: string;
  apartment: string;
  floor_number: string;
  street: string;
  nearby_landmark?: string;
}

export default function CheckoutPage() {
  const { user, cart, cartTotal, cartItemCount, clearCart, refreshUser } = useApp();
  const router = useRouter();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [manualAddress, setManualAddress] = useState<Address>({
    phone_number: '', building_name: '', apartment: '', floor_number: '', street: '', nearby_landmark: ''
  });
  const [useManualAddress, setUseManualAddress] = useState(false);
  
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    if (cartItemCount === 0) {
      router.push('/cart');
      return;
    }
    
    // Fetch user addresses and restaurant info to get delivery fee
    Promise.all([
      fetch('/api/user/address').then(r => r.json()),
      fetch(`/api/restaurants/${cart[0].restaurant_id}`).then(r => r.json())
    ]).then(([addressData, restaurantData]) => {
      if (addressData.addresses) {
        setSavedAddresses(addressData.addresses);
      }
      if (restaurantData.restaurant) {
        setDeliveryFee(restaurantData.restaurant.delivery_price);
      }
      setLoadingInitial(false);
    }).catch(() => setLoadingInitial(false));
  }, [cart, cartItemCount, router]);

  const totalBeforeDiscount = cartTotal + deliveryFee;
  let pointDiscount = 0;
  
  if (useLoyaltyPoints && user && user.loyalty_points >= 1000) {
    pointDiscount = Math.min(user.loyalty_points * 0.01, totalBeforeDiscount);
  }
  
  const finalTotal = Math.max(0, totalBeforeDiscount - pointDiscount);
  const canPlaceOrder = (selectedAddressId !== null) || (useManualAddress && manualAddress.phone_number && manualAddress.street);

  const handlePlaceOrder = async () => {
    setError('');
    
    if (!canPlaceOrder) {
      setError("Can't place an order without specifying the address"); // PAY-FR-04.1
      return;
    }

    if (useManualAddress) {
      // Validate AC-FR-02.1.1 rules for manual address too
      if (manualAddress.phone_number.length !== 11) {
        setError('Phone number must be exactly 11 digits.');
        return;
      }
      if (!/^\d+$/.test(manualAddress.phone_number)) {
        setError('Only numbers are allowed for phone.');
        return;
      }
      if (!manualAddress.building_name || !manualAddress.apartment || !manualAddress.floor_number || !manualAddress.street) {
        setError("All required fields must be filled");
        return;
      }
    }

    setPlacing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: cart[0].restaurant_id,
          items: cart,
          address_id: useManualAddress ? undefined : selectedAddressId,
          manual_address: useManualAddress ? {
            phone: manualAddress.phone_number,
            building: manualAddress.building_name,
            apartment: manualAddress.apartment,
            floor: manualAddress.floor_number,
            street: manualAddress.street,
            landmark: manualAddress.nearby_landmark
          } : undefined,
          use_points: useLoyaltyPoints
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to place order');
        setPlacing(false);
      } else {
        clearCart();
        refreshUser();
        router.push(`/order-confirmed?id=${data.order.id}&earned=${data.order.points_earned}`);
      }
    } catch {
      setError('A network error occurred');
      setPlacing(false);
    }
  };

  if (loadingInitial) {
    return <div className="page-content fade-in"><div className="empty-state">Loading checkout...</div></div>;
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="two-col">
        <div className="two-col-main">
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Delivery Address</h3>
            
            {savedAddresses.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Select a saved address:</p>
                {savedAddresses.map(addr => (
                  <div 
                    key={addr.id} 
                    className={`address-card ${!useManualAddress && selectedAddressId === addr.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedAddressId(addr.id!);
                      setUseManualAddress(false);
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{addr.street}, Building {addr.building_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Apt {addr.apartment}, Floor {addr.floor_number}. Phone: {addr.phone_number}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ margin: '20px 0', borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
              <label className="checkbox-label" style={{ fontWeight: 600 }}>
                <input 
                  type="checkbox" 
                  checked={useManualAddress || savedAddresses.length === 0} 
                  onChange={(e) => setUseManualAddress(e.target.checked)}
                />
                Use a new address for this order
              </label>
              
              {(useManualAddress || savedAddresses.length === 0) && (
                <div style={{ marginTop: 16 }} className="slide-up">
                  <div className="form-group">
                    <label className="form-label">Phone number (11 digits)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 01012345678"
                      value={manualAddress.phone_number}
                      onChange={e => setManualAddress({...manualAddress, phone_number: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Street</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Street name"
                      value={manualAddress.street}
                      onChange={e => setManualAddress({...manualAddress, street: e.target.value})}
                    />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Building</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={manualAddress.building_name}
                        onChange={e => setManualAddress({...manualAddress, building_name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Floor</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={manualAddress.floor_number}
                        onChange={e => setManualAddress({...manualAddress, floor_number: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Apartment</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={manualAddress.apartment}
                        onChange={e => setManualAddress({...manualAddress, apartment: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Landmark (optional)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={manualAddress.nearby_landmark}
                        onChange={e => setManualAddress({...manualAddress, nearby_landmark: e.target.value})}
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>* Manual address is for one-time use only</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Payment Method</h3>
            <div className="address-card selected" style={{ margin: 0 }}>
              <label className="checkbox-label" style={{ fontWeight: 600 }}>
                <input type="radio" checked readOnly />
                Cash on delivery
              </label>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8, marginLeft: 28 }}>
              Pay in cash to the driver upon delivery.
            </p>
          </div>
        </div>

        <div className="two-col-aside">
          <div className="order-summary">
            <h3 style={{ marginBottom: 16 }}>Order summary</h3>
            
            <div style={{ marginBottom: 16, pb: 16, borderBottom: '1px solid var(--border-color)' }}>
              {cart.map(item => (
                <div key={item.menu_item_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span>{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{cartTotal.toFixed(2)} EGP</span>
            </div>
            <div className="summary-row">
              <span>Delivery fee</span>
              <span>{deliveryFee.toFixed(2)} EGP</span>
            </div>
            
            <div style={{ margin: '16px 0', padding: '16px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
              <label className={`checkbox-label ${!user || user.loyalty_points < 1000 ? 'disabled' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={useLoyaltyPoints}
                  onChange={e => setUseLoyaltyPoints(e.target.checked)}
                  disabled={!user || user.loyalty_points < 1000}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>Redeem loyalty points</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Balance: {user?.loyalty_points || 0} pts
                    {user && user.loyalty_points >= 1000 ? ` (-${(user.loyalty_points * 0.01).toFixed(2)} EGP)` : ' (Min 1000 required)'}
                  </span>
                </div>
              </label>
            </div>

            {useLoyaltyPoints && pointDiscount > 0 && (
              <div className="summary-row" style={{ color: 'var(--accent-success)' }}>
                <span>Points discount</span>
                <span>-{pointDiscount.toFixed(2)} EGP</span>
              </div>
            )}

            <div className="summary-row total">
              <span>Total</span>
              <span>{finalTotal.toFixed(2)} EGP</span>
            </div>
            
            <button 
              className="btn btn-primary btn-block" 
              style={{ marginTop: 20 }}
              onClick={handlePlaceOrder}
              disabled={!canPlaceOrder || placing}
            >
              {placing ? 'Placing Order...' : 'Place order'}
            </button>
            {!canPlaceOrder && (
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--accent-secondary)', marginTop: 8 }}>
                Address required
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
