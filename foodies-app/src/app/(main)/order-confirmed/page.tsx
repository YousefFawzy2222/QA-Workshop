'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const pointsEarned = searchParams.get('earned');

  return (
    <div className="page-content fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ maxWidth: 500, width: '100%', textAlign: 'center', padding: '48px 32px' }}>
        <div className="success-icon">✓</div>
        <h1 className="auth-title">Order confirmed!</h1>
        <p className="auth-subtitle">Your order #{orderId || '...'} is on its way.</p>

        {pointsEarned && Number(pointsEarned) > 0 && (
          <div style={{ margin: '24px 0', padding: '16px', background: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Loyalty points earned:</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>+{pointsEarned} pts</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
          <Link href="/" className="btn btn-secondary" style={{ flex: 1 }}>Home</Link>
          <Link href="/account/loyalty" className="btn btn-primary" style={{ flex: 1 }}>View points</Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="page-content"><div className="empty-state">Loading...</div></div>}>
      <OrderConfirmedContent />
    </Suspense>
  );
}
