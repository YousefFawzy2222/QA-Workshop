'use client';
import { useEffect, useState, use } from 'react';
import { useApp } from '@/context/AppContext';

interface Offer {
  id: number;
  menu_item_id: number;
  item_name: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  is_combo: number;
}

interface RestaurantInfo {
  id: number;
  name: string;
  rating: number;
  delivery_time: number;
  delivery_price: number;
  open_time: string;
  close_time: string;
}

export default function RestaurantMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const restaurantId = parseInt(resolvedParams.id, 10);

  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useApp();
  const [addError, setAddError] = useState('');
  const [qtyInputs, setQtyInputs] = useState<Record<number, number>>({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then(res => res.json())
      .then(data => {
        setRestaurant(data.restaurant);
        setMenuItems(data.menuItems || []);
        setOffers(data.offers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [restaurantId]);

  // Check if restaurant is currently open based on server time mimicking (ADM-FR-02)
  const isRestaurantOpen = () => {
    if (!restaurant) return false;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    const [openH, openM] = restaurant.open_time.split(':').map(Number);
    const [closeH, closeM] = restaurant.close_time.split(':').map(Number);
    
    const openMins = openH * 60 + openM;
    let closeMins = closeH * 60 + closeM;
    
    if (closeMins <= openMins) closeMins += 24 * 60; // handles past midnight
    
    let currentAdjusted = currentMins;
    if (currentAdjusted < openMins && closeMins > 24 * 60) currentAdjusted += 24 * 60;
    
    return currentAdjusted >= openMins && currentAdjusted <= closeMins;
  };

  const handleAdd = (item: MenuItem, price: number) => {
    setAddError('');
    const qty = qtyInputs[item.id] || 1;
    const result = addToCart({
      menu_item_id: item.id,
      name: item.name,
      price,
      quantity: qty,
      restaurant_id: restaurantId,
      restaurant_name: restaurant!.name
    });

    if (!result.success) {
      setAddError(result.error!);
    } else {
      setShowModal(true); // Show "Item added to cart!" modal (ORD-FR-02)
    }
  };

  if (loading) return <div className="page-content fade-in"><div className="empty-state">Loading menu...</div></div>;
  if (!restaurant) return <div className="page-content fade-in"><div className="empty-state">Restaurant not found</div></div>;

  const isOpen = isRestaurantOpen();
  
  // Group menu items by category
  const categories = [...new Set(menuItems.map(m => m.category))];

  return (
    <div className="page-content fade-in">
      <div className="restaurant-header">
        <h1>{restaurant.name}</h1>
        <div className="restaurant-meta">
          <div className="rating-badge">⭐ {restaurant.rating}</div>
          <div className="restaurant-meta-item">🕐 {restaurant.delivery_time} min delivery</div>
          <div className="restaurant-meta-item">🚚 {restaurant.delivery_price} EGP delivery fee</div>
          <div className="restaurant-meta-item">🕒 Operating: {restaurant.open_time} - {restaurant.close_time}</div>
        </div>
      </div>

      {!isOpen && (
        <div className="closed-banner">
          ⚠ This restaurant is currently closed. You cannot add items to your cart.
        </div>
      )}

      {addError && <div className="error-banner">{addError}</div>}

      {offers.length > 0 && (
        <div className="admin-section">
          <h2 className="admin-section-title">✨ Special Offers</h2>
          {offers.map(offer => {
            const item = menuItems.find(m => m.id === offer.menu_item_id);
            if (!item) return null;
            return (
              <div key={`offer-${offer.id}`} className="menu-item-card">
                <div className="menu-item-info">
                  <h4>{item.name} <span style={{marginLeft:8, fontSize:'0.75rem', background:'var(--accent-secondary)', color:'white', padding:'2px 8px', borderRadius:'10px'}}>Offer</span></h4>
                  <p>{item.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 16 }}>
                    <span className="price-original" style={{ fontSize: '0.8rem' }}>{offer.original_price} EGP</span>
                    <span className="price-discounted" style={{ fontSize: '1.1rem' }}>{offer.discounted_price.toFixed(2)} EGP</span>
                  </div>
                  <div className="quantity-controls" style={{ display: isOpen ? 'flex' : 'none' }}>
                    <button className="qty-btn" onClick={() => setQtyInputs(prev => ({...prev, [item.id]: Math.max(1, (prev[item.id] || 1) - 1)}))}>-</button>
                    <span className="qty-value">{qtyInputs[item.id] || 1}</span>
                    <button className="qty-btn" onClick={() => setQtyInputs(prev => ({...prev, [item.id]: (prev[item.id] || 1) + 1}))}>+</button>
                  </div>
                  <button 
                    className="add-btn" 
                    disabled={!isOpen}
                    onClick={() => handleAdd(item, offer.discounted_price)}
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {categories.map(category => (
        <div key={category} className="admin-section">
          <h2 className="admin-section-title">{category}</h2>
          {menuItems.filter(m => m.category === category).map(item => {
            const hasOffer = offers.some(o => o.menu_item_id === item.id);
            if (hasOffer) return null; // Already displayed in offers section

            return (
              <div key={item.id} className="menu-item-card">
                <div className="menu-item-info">
                  <h4>{item.name} {item.is_combo === 1 && <span style={{marginLeft:8, fontSize:'0.75rem', background:'var(--bg-secondary)', padding:'2px 8px', borderRadius:'10px'}}>Combo</span>}</h4>
                  <p>{item.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="menu-item-price">{item.price} EGP</div>
                  <div className="quantity-controls" style={{ display: isOpen ? 'flex' : 'none' }}>
                    <button className="qty-btn" onClick={() => setQtyInputs(prev => ({...prev, [item.id]: Math.max(1, (prev[item.id] || 1) - 1)}))}>-</button>
                    <span className="qty-value">{qtyInputs[item.id] || 1}</span>
                    <button className="qty-btn" onClick={() => setQtyInputs(prev => ({...prev, [item.id]: Math.min(100, (prev[item.id] || 1) + 1)}))}>+</button>
                  </div>
                  <button 
                    className="add-btn" 
                    disabled={!isOpen}
                    onClick={() => handleAdd(item, item.price)}
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Item added to cart!</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>What would you like to do next?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Continue ordering</button>
              <button className="btn btn-primary" onClick={() => window.location.href = '/cart'}>View cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
