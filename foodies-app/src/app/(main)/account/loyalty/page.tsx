'use client';
import { useApp } from '@/context/AppContext';

export default function LoyaltyPage() {
  const { user } = useApp();
  
  if (!user) return null;
  
  const threshold = 1000;
  const points = user.loyalty_points;
  const percentage = Math.min(100, (points / threshold) * 100);

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">Loyalty & rewards</h1>
        <p className="page-subtitle">Earn points with every order (LOY-FR-01-04)</p>
      </div>

      <div className="two-col">
        <div className="two-col-main">
          <div className="loyalty-card">
            <div className="loyalty-points">{Math.floor(points)}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: 8 }}>Your points balance</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              (LOY-FR-03: Never negative)
            </div>

            <div style={{ marginTop: 40, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Progress to redemption</span>
                <span>{Math.floor(points)} / {threshold} points</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
              </div>
              
              {points < threshold ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {threshold - Math.floor(points)} more points needed
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                  You have enough points to redeem for a discount!
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="two-col-aside">
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>How points work</h3>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: 16, lineHeight: 1.8 }}>
              <li><strong>LOY-FR-01:</strong> 0.1 pt per 1 EGP spent</li>
              <li><strong>LOY-FR-02:</strong> Decimals rounded down (Floor)</li>
              <li><strong>LOY-FR-03:</strong> Points are never negative</li>
              <li><strong>LOY-FR-04:</strong> 1000 pts = 10 EGP discount</li>
            </ul>
            <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
              <strong>Example:</strong> Order subtotal of 258 EGP earns you exactly 25 pts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
