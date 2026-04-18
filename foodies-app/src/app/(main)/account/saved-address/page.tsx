'use client';
import { useState, useEffect } from 'react';

interface Address {
  id?: number;
  phone_number: string;
  building_name: string;
  apartment: string;
  floor_number: string;
  street: string;
  nearby_landmark?: string;
}

export default function SavedAddressPage() {
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [form, setForm] = useState<Address>({
    phone_number: '', building_name: '', apartment: '', floor_number: '', street: '', nearby_landmark: ''
  });

  useEffect(() => {
    fetch('/api/user/address')
      .then(res => res.json())
      .then(data => {
        if (data.addresses && data.addresses.length > 0) {
          setAddress(data.addresses[0]);
          setForm(data.addresses[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Client-side phone validation (AC-FR-02.1.1)
    if (!form.phone_number || !/^\d+$/.test(form.phone_number)) {
      setMessage({ type: 'error', text: 'Only numbers are allowed for phone.' });
      return;
    }
    if (form.phone_number.length !== 11) {
      setMessage({ type: 'error', text: 'Phone number must be exactly 11 digits.' });
      return;
    }
    
    if (!form.building_name || !form.apartment || !form.floor_number || !form.street) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setSaving(true);
    try {
      const method = address ? 'PUT' : 'POST';
      const body = address ? { ...form, id: address.id } : form;
      
      const res = await fetch('/api/user/address', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to save address' });
      } else {
        setMessage({ type: 'success', text: 'Address saved successfully' });
        setAddress(data.address);
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-content"><div className="empty-state">Loading...</div></div>;

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">Saved address</h1>
        <p className="page-subtitle">Manage your default delivery location</p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        {message.text && (
          <div className={message.type === 'error' ? 'error-banner' : 'success-banner'}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Phone number (Required)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 01012345678"
              value={form.phone_number}
              onChange={e => setForm({...form, phone_number: e.target.value})}
            />
            <div className="form-hint">Exactly 11 digits. Numeric digits only. (AC-FR-02.1.1)</div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Street (Required)</label>
            <input 
              type="text" 
              className="form-input" 
              value={form.street}
              onChange={e => setForm({...form, street: e.target.value})}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Building name/number (Required)</label>
              <input 
                type="text" 
                className="form-input" 
                value={form.building_name}
                onChange={e => setForm({...form, building_name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Floor number (Required)</label>
              <input 
                type="text" 
                className="form-input" 
                value={form.floor_number}
                onChange={e => setForm({...form, floor_number: e.target.value})}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Apartment (Required)</label>
              <input 
                type="text" 
                className="form-input" 
                value={form.apartment}
                onChange={e => setForm({...form, apartment: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nearby landmark (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. near the supermarket"
                value={form.nearby_landmark || ''}
                onChange={e => setForm({...form, nearby_landmark: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save address'}
          </button>
        </form>
      </div>
    </div>
  );
}
