'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

interface Restaurant {
  id: number;
  name: string;
  rating: number;
  open_time: string;
  close_time: string;
}

interface Offer {
  id: number;
  restaurant_name: string;
  item_name: string;
  discount_percentage: number;
  expires_at: string;
}

export default function AdminPanelPage() {
  const { user, loading: userLoading } = useApp();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'admin')) {
      router.replace('/');
      return;
    }

    if (user?.role === 'admin') {
      Promise.all([
        fetch('/api/restaurants').then(r => r.json()),
        fetch('/api/offers').then(r => r.json())
      ]).then(([restData, offData]) => {
        setRestaurants(restData.restaurants || []);
        setOffers(offData.offers || []);
        setLoading(false);
      });
    }
  }, [user, userLoading, router]);

  if (userLoading || loading) return <div className="page-content"><div className="empty-state">Loading administration...</div></div>;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin panel</h1>
        <p className="page-subtitle">Manage system configuration and promotions</p>
      </div>

      <div className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="admin-section-title">Restaurants (ADM-FR-01)</h2>
          <button className="btn btn-primary btn-sm">+ Add</button>
        </div>
        
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Working Hours (ADM-FR-02)</th>
                <th>Rating</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.open_time} - {r.close_time}</td>
                  <td>⭐ {r.rating}</td>
                  <td className="text-right">
                    <button className="btn btn-secondary btn-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="admin-section-title">Promotions (ADM-FR-03)</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm">+ Add</button>
            <button className="btn btn-secondary btn-sm">Edit</button>
          </div>
        </div>
        
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Restaurant</th>
                <th>Discount</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>{o.item_name}</td>
                  <td>{o.restaurant_name}</td>
                  <td><span className="rating-badge">{Math.round(o.discount_percentage)}%</span></td>
                  <td>
                    {new Date(o.expires_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center" style={{ padding: 32, color: 'var(--text-muted)' }}>
                    No active promotions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
