'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

const navItems = [
  { label: 'Home', href: '/', icon: '🏠', section: 'Main' },
  { label: 'Search', href: '/search', icon: '🔍', section: 'Main' },
  { label: 'Offers', href: '/offers', icon: '🏷️', section: 'Main' },
  { label: 'Cart', href: '/cart', icon: '🛒', section: 'Ordering', requiresCart: true },
  { label: 'Checkout', href: '/checkout', icon: '💳', section: 'Ordering', requiresCart: true },
  { label: 'My Account', href: '/account', icon: '👤', section: 'Account' },
  { label: 'Personal info', href: '/account/personal-info', icon: '📝', section: 'Account' },
  { label: 'Saved address', href: '/account/saved-address', icon: '📍', section: 'Account' },
  { label: 'Loyalty & rewards', href: '/account/loyalty', icon: '⭐', section: 'Account' },
  { label: 'Admin panel', href: '/admin', icon: '⚙️', section: 'Account', adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, cartItemCount } = useApp();

  const sections = ['Main', 'Ordering', 'Account'];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">FoodApp</div>
      <nav className="sidebar-nav">
        {sections.map((section) => {
          const items = navItems.filter((item) => {
            if (item.section !== section) return false;
            if (item.requiresCart && cartItemCount === 0) return false;
            if (item.adminOnly && (!user || user.role !== 'admin')) return false;
            return true;
          });
          if (items.length === 0) return null;
          return (
            <div key={section}>
              <div className="sidebar-section-title">{section}</div>
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                  {item.href === '/cart' && cartItemCount > 0 && (
                    <span className="rating-badge" style={{ marginLeft: 'auto' }}>
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
