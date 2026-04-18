'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Offer {
  id: number;
  item_name: string;
  restaurant_name: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  expires_at: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/offers')
      .then(res => res.json())
      .then(data => {
        setOffers(data.offers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">Offers</h1>
        <p className="page-subtitle">Current active promotions across all restaurants</p>
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading offers...</p></div>
      ) : offers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏷️</div>
          <div className="empty-state-title">No active offers</div>
          <p>Check back later for new promotions and discounts</p>
        </div>
      ) : (
        <div className="card-grid">
          {offers.map(offer => (
            <div key={offer.id} className="card" style={{ position: 'relative' }}>
              <div className="offer-badge">-{Math.round(offer.discount_percentage)}% OFF</div>
              <div className="card-image">
                <span>🍽️</span>
              </div>
              <div className="card-title">{offer.item_name}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                from <strong>{offer.restaurant_name}</strong>
              </p>
              <div className="card-meta">
                <span className="price-original">{offer.original_price} EGP</span>
                <span className="price-discounted">{offer.discounted_price.toFixed(2)} EGP</span>
              </div>
              <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Expires: {new Date(offer.expires_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
