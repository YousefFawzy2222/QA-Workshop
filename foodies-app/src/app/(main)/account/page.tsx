'use client';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, setUser } = useApp();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">My account</h1>
        <p className="page-subtitle">Manage your profile and settings</p>
      </div>

      <div style={{ maxWidth: 600 }}>
        {user && (
          <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ 
              width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-gradient)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#000', fontWeight: 800 
            }}>
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <div>
              <h2 style={{ marginBottom: 4 }}>{user.name || 'User'}</h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 4 }}>{user.email}</div>
              <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.15)', color: 'var(--accent-primary)', padding: '2px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600 }}>
                {user.loyalty_points} Points
              </div>
            </div>
          </div>
        )}

        <Link href="/account/personal-info" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="account-card">
            <div className="icon">📝</div>
            <div>
              <h4>Personal Info</h4>
              <p>Update your name and password</p>
            </div>
          </div>
        </Link>

        <Link href="/account/saved-address" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="account-card">
            <div className="icon">📍</div>
            <div>
              <h4>Saved Address</h4>
              <p>Manage your delivery address</p>
            </div>
          </div>
        </Link>
        
        <Link href="/account/loyalty" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="account-card">
            <div className="icon">⭐</div>
            <div>
              <h4>Loyalty & rewards</h4>
              <p>View your points balance and history</p>
            </div>
          </div>
        </Link>

        {user?.role === 'admin' && (
          <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="account-card" style={{ borderLeft: '3px solid var(--accent-info)' }}>
              <div className="icon" style={{ color: 'var(--accent-info)' }}>⚙️</div>
              <div>
                <h4>Admin panel</h4>
                <p>Manage restaurants and promotions</p>
              </div>
            </div>
          </Link>
        )}

        <button 
          onClick={handleLogout}
          className="account-card" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)', width: '100%', textAlign: 'left', fontFamily: 'var(--font-sans)' }}
        >
          <div className="icon" style={{ color: 'var(--accent-secondary)' }}>🚪</div>
          <div>
            <h4 style={{ color: 'var(--accent-secondary)' }}>Log out</h4>
            <p>Sign out of your account</p>
          </div>
        </button>
      </div>
    </div>
  );
}
