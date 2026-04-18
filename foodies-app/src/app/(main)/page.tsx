'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Restaurant {
  id: number;
  name: string;
  rating: number;
  delivery_time: number;
  delivery_price: number;
  open_time: string;
  close_time: string;
}

const restaurantEmojis: Record<string, string> = {
  'Burger Palace': '🍔',
  'Pizza House': '🍕',
  'Koshary El Tahrir': '🍜',
  'Shawarma Station': '🌯',
  'El Malem Grill': '🥩',
  'Sweet Tooth Bakery': '🍰',
};

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch('/api/restaurants')
      .then((r) => r.json())
      .then((data) => {
        setRestaurants(data.restaurants || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['All', 'Burgers', 'Pizza', 'Egyptian', 'Grills', 'Desserts'];

  const filterMap: Record<string, string[]> = {
    Burgers: ['Burger Palace'],
    Pizza: ['Pizza House'],
    Egyptian: ['Koshary El Tahrir', 'Shawarma Station'],
    Grills: ['El Malem Grill'],
    Desserts: ['Sweet Tooth Bakery'],
  };

  const filtered = filter === 'All' ? restaurants : restaurants.filter((r) => filterMap[filter]?.includes(r.name));

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">Nearby restaurants</h1>
        <p className="page-subtitle">Restaurants within 10km radius</p>
      </div>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-tab ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading restaurants...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📍</div>
          <div className="empty-state-title">No restaurants available nearby</div>
          <p>Try adjusting your location or check back later</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((r) => (
            <Link key={r.id} href={`/restaurant/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card">
                <div className="card-image">
                  <span>{restaurantEmojis[r.name] || '🍽️'}</span>
                </div>
                <div className="card-title">{r.name}</div>
                <div className="card-meta">
                  <span className="rating-badge">⭐ {r.rating}</span>
                  <span className="card-meta-item">🕐 {r.delivery_time} min</span>
                  <span className="card-meta-item">🚚 {r.delivery_price} EGP</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
