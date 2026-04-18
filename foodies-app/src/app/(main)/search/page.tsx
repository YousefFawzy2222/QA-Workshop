'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Restaurant {
  id: number;
  name: string;
  rating: number;
  delivery_time: number;
  delivery_price: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('name');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  const fetchResults = useCallback(async (searchQuery: string, sortOpt: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&sort=${sortOpt}`);
      const data = await res.json();
      setRestaurants(data.restaurants || []);
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    fetchResults('', sort);
  }, [sort, fetchResults]);

  const handleSearchClick = () => {
    fetchResults(query, sort);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchResults(query, sort);
    }
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">Search</h1>
        <p className="page-subtitle">Find your favorite restaurants</p>
      </div>

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search for restaurants... (e.g. Burger or Pizza)" 
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <select 
          className="search-select" 
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="name">Sort: Name (A-Z)</option>
          <option value="rating">Sort: Rating (High - Low)</option>
          <option value="delivery_time">Sort: Fastest Delivery</option>
          <option value="delivery_price">Sort: Delivery Fee (Low - High)</option>
        </select>
        <button className="btn btn-primary" onClick={handleSearchClick}>Search</button>
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Searching...</p></div>
      ) : restaurants.length === 0 && searched ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">When no matching restaurants exist: &quot;No matching restaurants&quot; message shown</div>
          <p>Try different keywords or check spelling.</p>
        </div>
      ) : (
        <div className="card-grid">
          {restaurants.map(r => (
            <Link key={r.id} href={`/restaurant/${r.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
              <div className="card">
                <div className="card-image"><span>🍽️</span></div>
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
