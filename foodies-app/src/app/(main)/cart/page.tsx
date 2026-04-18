'use client';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, cartTotal, cartItemCount } = useApp();

  if (cartItemCount === 0) {
    return (
      <div className="page-content fade-in">
        <div className="empty-state" style={{ marginTop: 60 }}>
          <div className="empty-state-icon">🛒</div>
          <div className="empty-state-title">Your cart is empty</div>
          <p>Looks like you haven&apos;t added any food yet.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 20 }}>
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  // Group by restaurant to verify Single Restaurant Rule visually
  const restaurantName = cart[0]?.restaurant_name || 'Restaurant';

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">Your cart</h1>
        <p className="page-subtitle">Ordering from: <strong>{restaurantName}</strong></p>
      </div>

      <div className="two-col">
        <div className="two-col-main">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.menu_item_id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                    </td>
                    <td>
                      <div className="quantity-controls" style={{ width: 'fit-content', margin: '0 auto' }}>
                        <button 
                          className="qty-btn" 
                          onClick={() => updateCartQuantity(item.menu_item_id, item.quantity - 1)}
                        >-</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button 
                          className="qty-btn" 
                          onClick={() => updateCartQuantity(item.menu_item_id, item.quantity + 1)}
                        >+</button>
                      </div>
                    </td>
                    <td className="text-right" style={{ fontWeight: 600 }}>
                      {(item.price * item.quantity).toFixed(2)} EGP
                    </td>
                    <td className="text-right">
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => removeFromCart(item.menu_item_id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="two-col-aside">
          <div className="order-summary">
            <h3 style={{ marginBottom: 16 }}>Order summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{cartTotal.toFixed(2)} EGP</span>
            </div>
            <div className="summary-row">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Delivery fee will be calculated at checkout</span>
            </div>
            <div className="summary-row total" style={{ borderTop: 'none', marginTop: 16, paddingTop: 0 }}>
              <Link href="/checkout" className="btn btn-primary btn-block">
                Proceed to checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
