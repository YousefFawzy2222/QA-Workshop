'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

export default function PersonalInfoPage() {
  const { user, refreshUser } = useApp();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: password || undefined }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setPassword('');
        refreshUser();
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">Personal info</h1>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        {message.text && (
          <div className={message.type === 'error' ? 'error-banner' : 'success-banner'}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Display name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ahmed Hassan"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input 
              type="text" 
              className="form-input" 
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <div className="form-hint">Email address cannot be changed.</div>
          </div>

          <div className="form-group">
            <label className="form-label">New password (optional)</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
            {password && (
              <div className="form-hint" style={{ marginTop: 8 }}>
                Must be 8-64 characters containing 1 uppercase, 1 lowercase, 1 number, and 1 special character.
              </div>
            )}
          </div>

          <div style={{ marginTop: 32 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
