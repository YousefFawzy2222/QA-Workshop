// ═══════════════════════════════════════════
// Shop Module — Cart, Restaurant Menu, Checkout, Profile, Loyalty
// ═══════════════════════════════════════════

const shopApi = {
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  currentRestaurant: null,

  // ── Cart Management ──
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartBadge();
  },

  addToCart(item, qty = 1) {
    const existing = this.cart.find(c => c.menuItemId === item.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.cart.push({
        menuItemId: item.id,
        name: item.itemName,
        price: item.getIsOnDiscount ? item.discountedPrice : item.itemCost,
        rawPrice: item.itemCost,
        quantity: qty,
        restaurantId: item.restaurantId
      });
    }
    this.saveCart();
  },

  removeFromCart(menuItemId) {
    this.cart = this.cart.filter(c => c.menuItemId !== menuItemId);
    this.saveCart();
  },

  updateQty(menuItemId, delta) {
    const item = this.cart.find(c => c.menuItemId === menuItemId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) this.removeFromCart(menuItemId);
    else this.saveCart();
  },

  getSubtotal() {
    return this.cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  },

  clearCart() {
    this.cart = [];
    this.saveCart();
  },

  updateCartBadge() {
    const btn = document.getElementById('topbar-cart');
    const navCart = document.getElementById('nav-cart');
    const navCheckout = document.getElementById('nav-checkout');
    const count = this.cart.reduce((s, c) => s + c.quantity, 0);
    if (count > 0) {
      if (btn) { btn.textContent = `🛒 Cart (${count})`; btn.classList.remove('hidden'); }
      if (navCart) navCart.classList.remove('hidden');
      if (navCheckout) navCheckout.classList.remove('hidden');
    } else {
      if (btn) btn.classList.add('hidden');
      if (navCart) navCart.classList.add('hidden');
      if (navCheckout) navCheckout.classList.add('hidden');
    }
  },

  // ── S7: Restaurant Menu ──
  _isRestaurantOpen(rest) {
    // Compare current time against restaurant open/close window (ADM-FR-02)
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = (rest.openTime || '00:00').split(':').map(Number);
    const [closeH, closeM] = (rest.closeTime || '23:59').split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    // Handle overnight hours (e.g., 11:00 - 01:00)
    if (closeMinutes <= openMinutes) {
      return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  },

  async loadRestaurant(restId) {
    const resRest = await apiClient.get(`/admin/restaurants`);
    if (!resRest.ok) return;
    const rest = (resRest.data.restaurants || []).find(r => r.id === restId);
    if (!rest) return;
    this.currentRestaurant = rest;

    const resItems = await apiClient.get(`/admin/restaurants/${restId}/items`);
    const items = resItems.ok ? (resItems.data.items || []) : [];

    const isOpen = this._isRestaurantOpen(rest);

    const s7 = document.getElementById('s7');
    if (!s7) return;
    s7.innerHTML = `
      <div style="display:flex;align-items:flex-end;gap:20px;margin-bottom:28px;">
        <div style="width:120px;height:120px;background:var(--c-bg-tertiary);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;">🍽️</div>
        <div>
          <h2 style="font-size:24px;font-weight:700;margin-bottom:4px;">${rest.restName}</h2>
          <p style="font-size:13px;color:var(--c-text-secondary);"><span class="star">★</span> ${rest.restRate || 0} · ${rest.restMaxDeliveryTime} min · ${rest.restDeliveryCost} EGP delivery</p>
          <span class="tag ${isOpen ? 'tag-success' : 'tag-error'}" style="margin-top:6px;display:inline-block;">${isOpen ? 'Open Now' : 'Closed'}</span>
        </div>
      </div>
      ${!isOpen ? '<div style="background:var(--c-danger-bg, #fef2f2);border:1px solid var(--c-danger, #ef4444);border-radius:10px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:10px;"><span style="font-size:20px;">🚫</span><div><div style="font-weight:600;font-size:13px;color:var(--c-danger);">This restaurant is currently closed and not accepting orders.</div><div style="font-size:12px;color:var(--c-text-secondary);margin-top:2px;">Operating hours: '+rest.openTime+' – '+rest.closeTime+'</div></div></div>' : ''}
      <div class="divider"></div>
      <h3 class="section-heading" style="font-size:15px;">Menu items</h3>
      <div class="two-col" style="margin-top:14px;" id="menu-items-grid">
        ${items.length === 0 ? '<p style="color:var(--c-text-secondary)">No menu items yet.</p>' : items.map(item => `
          <div class="menu-card" ${!isOpen ? 'style="opacity:0.6;"' : ''}>
            <div style="display:flex;gap:14px;">
              <div class="menu-card-img" style="background:var(--c-bg-tertiary);display:flex;align-items:center;justify-content:center;font-size:1.5rem;">🍔</div>
              <div style="flex:1;">
                <div style="font-size:14px;font-weight:600;">${item.itemName}</div>
                <div style="font-size:12px;color:var(--c-text-secondary);margin:4px 0;">${item.description || item.itemSize || ''}</div>
                ${item.isOnDiscount ? `<span style="text-decoration:line-through;color:var(--c-text-muted);font-size:12px;">${item.itemCost} EGP</span> <span style="font-size:15px;font-weight:600;color:var(--c-danger);">${(item.itemCost * (1 - item.discountPercentage/100)).toFixed(0)} EGP</span>` : `<div style="font-size:15px;font-weight:600;">${item.itemCost} EGP</div>`}
              </div>
            </div>
            <div class="divider"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <div class="qty"><button class="qty-btn" onclick="shopApi.menuQty(${item.id},-1)" ${!isOpen ? 'disabled' : ''}>−</button><span class="qty-val" id="mqty-${item.id}">1</span><button class="qty-btn" onclick="shopApi.menuQty(${item.id},1)" ${!isOpen ? 'disabled' : ''}>+</button></div>
              <button class="btn btn-primary btn-sm" onclick="shopApi.addMenuItem(${item.id})" ${!isOpen ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Add to cart</button>
            </div>
          </div>
        `).join('')}
      </div>`;
    this._menuItems = items;
  },

  menuQty(itemId, delta) {
    const el = document.getElementById(`mqty-${itemId}`);
    if (!el) return;
    let v = parseInt(el.textContent) + delta;
    if (v < 1) v = 1;
    el.textContent = v;
  },

  addMenuItem(itemId) {
    const item = (this._menuItems || []).find(i => i.id === itemId);
    if (!item) return;
    const qtyEl = document.getElementById(`mqty-${itemId}`);
    const qty = qtyEl ? parseInt(qtyEl.textContent) : 1;
    const price = item.isOnDiscount ? item.itemCost * (1 - item.discountPercentage/100) : item.itemCost;
    const existing = this.cart.find(c => c.menuItemId === item.id);
    if (existing) { existing.quantity += qty; }
    else { this.cart.push({ menuItemId: item.id, name: item.itemName, price, rawPrice: item.itemCost, quantity: qty, restaurantId: item.restaurantId }); }
    this.saveCart();
    alert(`${item.itemName} × ${qty} added to cart!`);
  },

  // ── S9: Cart ──
  renderCart() {
    const s9 = document.getElementById('s9');
    if (!s9) return;
    if (this.cart.length === 0) {
      s9.innerHTML = `<h2 class="section-heading">Your cart</h2><div class="empty-state" style="padding:60px;text-align:center;"><div style="font-size:48px;margin-bottom:12px;">🛒</div><h3 style="font-size:18px;margin-bottom:6px;">Your cart is empty</h3><p style="color:var(--c-text-secondary);">Add items from a restaurant to get started.</p><button class="btn btn-primary" style="margin-top:16px;" onclick="go(3)">Browse restaurants</button></div>`;
      return;
    }
    const sub = this.getSubtotal();
    const delivery = this.currentRestaurant ? this.currentRestaurant.restDeliveryCost : 15;
    const total = sub + delivery;
    s9.innerHTML = `
      <h2 class="section-heading">Your cart</h2>
      <p class="section-sub">Review your items before checkout.</p>
      <div class="two-col" style="align-items:start;">
        <div>
          <table class="data-table"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Action</th></tr></thead>
          <tbody>${this.cart.map(c => `<tr>
            <td style="font-weight:500;">${c.name}</td>
            <td><div class="qty"><button class="qty-btn" onclick="shopApi.updateQty(${c.menuItemId},-1);shopApi.renderCart()">−</button><span class="qty-val">${c.quantity}</span><button class="qty-btn" onclick="shopApi.updateQty(${c.menuItemId},1);shopApi.renderCart()">+</button></div></td>
            <td style="font-weight:500;">${(c.price * c.quantity).toFixed(0)} EGP</td>
            <td><span style="font-size:12px;color:var(--c-danger);cursor:pointer;font-weight:500;" onclick="shopApi.removeFromCart(${c.menuItemId});shopApi.renderCart()">Remove</span></td>
          </tr>`).join('')}</tbody></table>
        </div>
        <div class="card">
          <h3 style="font-size:15px;font-weight:600;margin-bottom:14px;">Order summary</h3>
          <div class="row"><span style="font-size:13px;color:var(--c-text-secondary);">Subtotal</span><span>${sub.toFixed(0)} EGP</span></div>
          <div class="row"><span style="font-size:13px;color:var(--c-text-secondary);">Delivery fee</span><span>${delivery} EGP</span></div>
          <div class="divider"></div>
          <div class="row"><span style="font-size:16px;font-weight:600;">Total</span><span style="font-size:16px;font-weight:600;">${total.toFixed(0)} EGP</span></div>
          <button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="go(10)">Proceed to checkout</button>
        </div>
      </div>`;
  },

  // ── S10: Checkout ──
  _pointsCredit: 0,
  _pointsBalance: 0,

  async renderCheckout() {
    const s10 = document.getElementById('s10');
    if (!s10) return;
    const sub = this.getSubtotal();
    const delivery = this.currentRestaurant ? this.currentRestaurant.restDeliveryCost : 15;
    this._pointsCredit = 0;
    this._pointsBalance = 0;

    // Loyalty
    let loyaltyHtml = '';
    try {
      const loyRes = await apiClient.get('/user/loyalty');
      if (loyRes.ok) {
        const pts = loyRes.data.pointsBalance || 0;
        this._pointsBalance = pts;
        const canRedeem = pts >= 1000;
        const credit = Math.floor(pts * 0.01);
        this._pointsCredit = canRedeem ? credit : 0;
        loyaltyHtml = `<div class="card"><h3 style="font-size:14px;font-weight:600;margin-bottom:14px;">Loyalty &amp; rewards</h3>
          <div style="display:flex;align-items:center;gap:12px;">
            <input type="checkbox" id="use-points" ${canRedeem ? '' : 'disabled'} onchange="shopApi.togglePoints()">
            <div style="flex:1;"><div style="font-size:13px;font-weight:500;">${canRedeem ? 'Redeem points &rarr; '+credit+' EGP credit' : 'Not enough points (need 1000)'}</div><div style="font-size:12px;color:var(--c-text-secondary);">Balance: ${pts} pts</div></div>
          </div></div>`;
      }
    } catch(e) {}

    // Address
    let addrHtml = '';
    let hasAddress = false;
    try {
      const aRes = await apiClient.get('/address');
      if (aRes.ok && aRes.data && aRes.data.length > 0) {
        hasAddress = true;
        addrHtml = aRes.data.map((a,i) => `<div class="address-card${i===0?' selected':''}" onclick="document.querySelectorAll('.address-card').forEach(c=>c.classList.remove('selected'));this.classList.add('selected');shopApi._selectedAddr=${a.id};"><div style="font-size:13px;font-weight:600;">Address ${i+1}</div><div style="font-size:12px;color:var(--c-text-secondary);">${a.phoneNumber||''} &middot; ${a.buildingName||''}, Apt ${a.aptNumber||''}, ${a.street||''}</div></div>`).join('');
        this._selectedAddr = aRes.data[0].id;
      }
    } catch(e) {}

    // If no address, show inline temp form instead of linking to S14
    if (!hasAddress) {
      this._selectedAddr = null;
      this._tempAddrId = null;
      addrHtml = `<div id="checkout-addr-form">
        <p style="color:var(--c-text-secondary);margin-bottom:12px;">Enter a delivery address for this order:</p>
        <div class="two-col"><div><label class="field-label">Phone number</label><input class="field-input" id="co-phone" placeholder="01X XXXX XXXX"></div><div><label class="field-label">Building</label><input class="field-input" id="co-building" placeholder="Building name"></div></div>
        <div class="two-col"><div><label class="field-label">Apartment</label><input class="field-input" id="co-apt" placeholder="Apt"></div><div><label class="field-label">Floor</label><input class="field-input" id="co-floor" placeholder="Floor"></div></div>
        <div class="two-col"><div><label class="field-label">Street</label><input class="field-input" id="co-street" placeholder="Street"></div><div><label class="field-label">Landmark (optional)</label><input class="field-input" id="co-landmark" placeholder="Nearby"></div></div>
        <div id="co-addr-error" style="color:var(--c-danger);font-size:12px;display:none;margin-top:4px;">Please fill all required fields</div>
      </div>`;
    }

    const total = sub + delivery;
    const placeDisabled = '';

    s10.innerHTML = `
      <h2 class="section-heading">Checkout</h2>
      <div class="checkout-grid"><div>
        <div class="card"><h3 style="font-size:14px;font-weight:600;margin-bottom:14px;">Delivery address</h3>${addrHtml}</div>
        ${loyaltyHtml}
        <div class="card"><h3 style="font-size:14px;font-weight:600;margin-bottom:14px;">Payment method</h3><div style="display:flex;align-items:center;gap:10px;"><div class="radio-dot filled"></div><span style="font-size:13px;">Cash on delivery</span><span class="tag tag-success" style="margin-left:auto;">Only option</span></div></div>
      </div><div>
        <div class="card" style="position:sticky;top:0;">
          <h3 style="font-size:15px;font-weight:600;margin-bottom:14px;">Order summary</h3>
          <div class="row"><span style="font-size:13px;color:var(--c-text-secondary);">Subtotal</span><span>${sub.toFixed(0)} EGP</span></div>
          <div class="row"><span style="font-size:13px;color:var(--c-text-secondary);">Delivery fee</span><span>${delivery} EGP</span></div>
          <div id="points-discount-row" style="display:none;"><div class="row"><span style="font-size:13px;color:var(--c-danger);">Points discount</span><span style="color:var(--c-danger);" id="points-discount-val"></span></div></div>
          <div class="divider"></div>
          <div class="row"><span style="font-size:16px;font-weight:600;">Total</span><span style="font-size:16px;font-weight:600;" id="checkout-total">${total.toFixed(0)} EGP</span></div>
          <div class="divider"></div>
          <button class="btn btn-primary btn-full" id="place-order-btn" onclick="shopApi.placeOrder()" ${placeDisabled}>Place order</button>
        </div>
      </div></div>`;
  },

  togglePoints() {
    const cb = document.getElementById('use-points');
    const discountRow = document.getElementById('points-discount-row');
    const discountVal = document.getElementById('points-discount-val');
    const totalEl = document.getElementById('checkout-total');
    const sub = this.getSubtotal();
    const delivery = this.currentRestaurant ? this.currentRestaurant.restDeliveryCost : 15;
    let total = sub + delivery;
    if (cb && cb.checked && this._pointsCredit > 0) {
      const discount = Math.min(this._pointsCredit, total);
      total -= discount;
      if (discountRow) discountRow.style.display = 'block';
      if (discountVal) discountVal.textContent = '-' + discount + ' EGP';
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }
    if (totalEl) totalEl.textContent = total.toFixed(0) + ' EGP';
  },

  // ── Place Order ──
  _tempAddrId: null,

  async placeOrder() {
    if (this.cart.length === 0) { alert('Cart is empty'); return; }

    // If inline checkout address form is present, save it temporarily
    const coForm = document.getElementById('checkout-addr-form');
    if (coForm && !this._selectedAddr) {
      const phone = document.getElementById('co-phone')?.value || '';
      const building = document.getElementById('co-building')?.value || '';
      const apt = document.getElementById('co-apt')?.value || '';
      const floor = document.getElementById('co-floor')?.value || '';
      const street = document.getElementById('co-street')?.value || '';
      const landmark = document.getElementById('co-landmark')?.value || '';
      const errEl = document.getElementById('co-addr-error');

      if (!phone.trim() || !building.trim() || !street.trim()) {
        if (errEl) { errEl.textContent = "Can't place an order without specifying the address"; errEl.style.display = 'block'; }
        return;
      }

      // Save temp address via API
      const addrRes = await apiClient.post('/address', {
        phoneNumber: phone, buildingName: building,
        aptNumber: parseInt(apt) || 0, floorNumber: parseInt(floor) || 0,
        street: street, nearbyLandmark: landmark
      });
      if (!addrRes.ok) {
        if (errEl) { errEl.textContent = addrRes.data?.error || 'Failed to save address'; errEl.style.display = 'block'; }
        return;
      }
      this._selectedAddr = addrRes.data.id;
      this._tempAddrId = addrRes.data.id;
    }

    if (!this._selectedAddr) {
      alert("Can't place an order without specifying the address");
      return;
    }

    const restId = this.cart[0].restaurantId;
    const usePoints = document.getElementById('use-points')?.checked || false;
    const body = { restaurantId: restId, addressId: this._selectedAddr, usePoints, items: this.cart.map(c => ({ menuItemId: c.menuItemId, quantity: c.quantity })) };
    const res = await apiClient.post('/orders', body);
    if (res.ok) {
      const order = res.data.order;

      // Delete temp address so it doesn't persist in profile
      if (this._tempAddrId) {
        try { await apiClient.delete('/address/' + this._tempAddrId); } catch(e) {}
        this._tempAddrId = null;
      }

      this.clearCart();
      this.renderConfirmed(order);
      go(11);
    } else { alert('Order failed: ' + (res.data.error || 'Unknown error')); }
  },

  renderConfirmed(order) {
    const s11 = document.getElementById('s11');
    if (!s11 || !order) return;
    s11.innerHTML = `<div style="max-width:560px;margin:0 auto;text-align:center;padding-top:40px;">
      <div class="success-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
      <h2 style="font-size:24px;font-weight:700;margin-bottom:6px;">Order confirmed!</h2>
      <p style="font-size:14px;color:var(--c-text-secondary);margin-bottom:28px;">Your order is on its way.</p>
      <div class="card" style="text-align:left;">
        <div class="row"><span style="color:var(--c-text-secondary);">Total paid</span><span style="font-weight:500;">${order.totalPrice?.toFixed(0) || 0} EGP</span></div>
        <div class="row"><span style="color:var(--c-text-secondary);">Payment</span><span>Cash on delivery</span></div>
        <div class="divider"></div>
        <div class="row"><span style="color:var(--c-text-secondary);">Points earned</span><span class="tag tag-success">+${order.pointsEarned || 0} pts</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;">
        <button class="btn btn-secondary btn-full" onclick="go(3)">Back to home</button>
        <button class="btn btn-primary btn-full" onclick="go(16)">View loyalty</button>
      </div></div>`;
  },

  // ── S12: My Account ──
  async renderAccount() {
    const email = localStorage.getItem('userEmail') || 'guest';
    const s12 = document.getElementById('s12');
    if (!s12) return;
    let name = 'User', pts = 0;
    try { const r = await apiClient.get('/user/profile'); if (r.ok) { name = r.data.userName || 'User'; pts = r.data.loyaltyPoints || 0; } } catch(e){}
    const initial = name.charAt(0).toUpperCase();
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    s12.innerHTML = `<h2 class="section-heading">My account</h2><div class="two-col" style="align-items:start;"><div>
      <div class="card" style="display:flex;align-items:center;gap:14px;"><div style="width:52px;height:52px;border-radius:50%;background:var(--c-accent-light);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:18px;color:var(--c-accent);">${initial}</div><div><div style="font-size:16px;font-weight:600;">${name}</div><div style="font-size:13px;color:var(--c-text-secondary);">${email}</div></div></div>
      <div class="card" style="padding:0 18px;">
        <div class="menu-row" onclick="go(13)"><span style="font-size:13px;">Personal info</span><span style="color:var(--c-text-muted);">›</span></div>
        <div class="menu-row" onclick="go(16)"><span style="font-size:13px;">Loyalty & rewards</span><span style="color:var(--c-text-muted);">›</span></div>
        ${isAdmin ? '<div class="menu-row" onclick="go(17)"><span style="font-size:13px;">Admin panel</span><span style="color:var(--c-text-muted);">›</span></div>' : ''}
        <div class="menu-row" onclick="shopApi.logout()"><span style="font-size:13px;color:var(--c-danger);">Log out</span><span style="color:var(--c-text-muted);">›</span></div>
      </div></div><div></div></div>`;
  },

  // ── S13: Personal Info ──
  async renderPersonalInfo() {
    const email = localStorage.getItem('userEmail') || '';
    const s13 = document.getElementById('s13');
    if (!s13) return;
    let name = 'User';
    try { const r = await apiClient.get('/user/profile'); if (r.ok) name = r.data.userName || 'User'; } catch(e){}
    s13.innerHTML = `<h2 class="section-heading">Personal info</h2><div class="two-col" style="align-items:start;"><div class="card">
      <h3 style="font-size:14px;font-weight:600;margin-bottom:14px;">Profile details</h3>
      <div class="menu-row"><div><div style="font-size:12px;color:var(--c-text-secondary);">Display name</div><div style="font-size:13px;margin-top:2px;" id="profile-name-display">${name}</div></div><button class="btn btn-secondary btn-sm" onclick="shopApi.editName()">Edit</button></div>
      <div class="menu-row"><div><div style="font-size:12px;color:var(--c-text-secondary);">Email address</div><div style="font-size:13px;color:var(--c-text-muted);margin-top:2px;">${email}</div></div></div>
      <button class="btn btn-secondary btn-full" style="margin-top:10px;" onclick="go(14)">Manage saved address ›</button>
    </div><div></div></div>`;
  },

  async editName() {
    const newName = prompt('Enter new display name:');
    if (!newName || !newName.trim()) return;
    const res = await apiClient.put('/user/profile', { userName: newName.trim() });
    if (res.ok) { const el = document.getElementById('profile-name-display'); if (el) el.textContent = newName.trim(); }
    else alert('Failed: ' + (res.data?.error || ''));
  },

  // ── S16: Loyalty ──
  async renderLoyalty() {
    const s16 = document.getElementById('s16');
    if (!s16) return;
    let pts = 0, egp = 0, redeemable = false;
    try { const r = await apiClient.get('/user/loyalty'); if (r.ok) { pts = r.data.pointsBalance || 0; egp = r.data.egpValue || 0; redeemable = r.data.isRedeemable || false; } } catch(e){}
    const pct = Math.min(100, (pts / 1000) * 100);
    s16.innerHTML = `<h2 class="section-heading">Loyalty & rewards</h2><div class="two-col" style="align-items:start;"><div>
      <div class="card" style="text-align:center;padding:32px;"><div style="font-size:52px;font-weight:700;color:var(--c-accent);">${pts}</div><div style="font-size:14px;color:var(--c-text-secondary);margin-top:4px;">Your points balance</div></div>
      <div class="card-muted"><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--c-text-secondary);margin-bottom:6px;"><span>Progress to redemption</span><span>${pts} / 1000 pts</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%;"></div></div>
      <div style="font-size:12px;color:var(--c-text-muted);margin-top:8px;">${redeemable ? 'You can redeem your points!' : (1000-pts)+' more points to redeem'}</div></div>
    </div><div class="card-muted"><h4 style="font-size:14px;font-weight:600;margin-bottom:14px;">How points work</h4>
      <div style="font-size:13px;color:var(--c-text-secondary);line-height:2;"><strong style="color:var(--c-text);">Earn:</strong> 0.1 point per 1 EGP spent<br><strong style="color:var(--c-text);">Redeem:</strong> 1000 pts = 10 EGP credit<br><strong style="color:var(--c-text);">Rounding:</strong> Decimals rounded down<br>Example: 250 EGP order → 25 pts earned</div></div></div>`;
  },

  logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    this.clearCart();
    go(0);
  }
};

window.shopApi = shopApi;
document.addEventListener('DOMContentLoaded', () => shopApi.updateCartBadge());
