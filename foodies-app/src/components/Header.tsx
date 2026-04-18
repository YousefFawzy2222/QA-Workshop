'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useState, useRef, useEffect } from 'react';

export default function Header({ title }: { title?: string }) {
  const { user, setUser, cartItemCount } = useApp();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        {title && <h1 className="header-title">{title}</h1>}
        <div className="header-tabs">
          <Link href="/" className="header-tab">Home</Link>
          <Link href="/offers" className="header-tab">Offers</Link>
          {cartItemCount > 0 && (
            <Link href="/cart" className="header-tab">Cart ({cartItemCount})</Link>
          )}
          <Link href="/account" className="header-tab">My Account</Link>
        </div>
      </div>
      <div className="header-right" ref={menuRef}>
        <div className="header-user" onClick={() => setShowMenu(!showMenu)}>
          <div className="user-avatar">
            {user?.name ? user.name[0].toUpperCase() : user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span>{user?.name || user?.email || 'User'}</span>
        </div>
        {showMenu && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 8,
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', padding: 8, minWidth: 180, zIndex: 100,
            boxShadow: 'var(--shadow-lg)'
          }}>
            <Link href="/account/personal-info" className="sidebar-link" onClick={() => setShowMenu(false)}>
              <span className="icon">📝</span> Personal Info
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="sidebar-link" onClick={() => setShowMenu(false)}>
                <span className="icon">⚙️</span> Admin Panel
              </Link>
            )}
            <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)' }}>
              <span className="icon">🚪</span> Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
