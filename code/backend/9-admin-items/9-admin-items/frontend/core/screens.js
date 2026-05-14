// Remaining screen HTML templates injected into DOM
const ph = document.getElementById('screens-placeholder');
ph.innerHTML = `

<!-- S7: RESTAURANT MENU -->
<div class="screen" id="s7">
  <div style="display:flex;align-items:flex-end;gap:20px;margin-bottom:28px;">
    <div style="width:120px;height:120px;background-size:cover;background-position:center;background-image:url(images/burger.png);border-radius:14px;"></div>
    <div>
      <h2 style="font-size:24px;font-weight:700;margin-bottom:4px;">Burger Palace</h2>
      <p style="font-size:13px;color:var(--c-text-secondary);"><span class="star">★</span> 4.7 · 25–35 min · 15 EGP delivery</p>
    </div>
  </div>
  <h3 class="section-heading" style="font-size:15px;">Special Offers</h3>
  <div class="offer-card" style="border:1px dashed var(--c-warn);background:var(--c-warn-bg);margin-bottom:20px;">
    <div class="offer-card-img" style="background-image:url(images/burger.png);"></div>
    <div style="flex:1;"><div style="font-size:14px;font-weight:600;color:var(--c-warn);">20% OFF — Classic Burger</div><div style="font-size:12px;color:var(--c-warn);margin-top:4px;">Applied automatically at checkout</div></div>
  </div>
  <div class="divider"></div>
  <h3 class="section-heading" style="font-size:15px;">Menu items</h3>
  <div class="two-col" style="margin-top:14px;">
    <div class="menu-card">
      <div style="display:flex;gap:14px;">
        <div class="menu-card-img" style="background-image:url(images/burger.png);"></div>
        <div style="flex:1;"><div style="font-size:14px;font-weight:600;">Classic Burger</div><div style="font-size:12px;color:var(--c-text-secondary);margin:4px 0;">Beef patty, lettuce, tomato, pickles</div><div style="font-size:15px;font-weight:600;">85 EGP</div></div>
      </div>
      <div class="divider"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div class="qty"><button class="qty-btn">−</button><span class="qty-val">1</span><button class="qty-btn">+</button></div>
        <button class="btn btn-primary btn-sm" onclick="go(8)">Add to cart</button>
      </div>
    </div>
    <div class="menu-card" style="opacity:.65;">
      <div style="display:flex;gap:14px;">
        <div class="menu-card-img" style="background-image:url(images/combo.png);"></div>
        <div style="flex:1;"><div style="font-size:14px;font-weight:600;">Combo Meal</div><div style="font-size:12px;color:var(--c-text-secondary);margin:4px 0;">Burger + fries + drink</div><div style="font-size:15px;font-weight:600;">120 EGP</div></div>
      </div>
      <div class="divider"></div>
      <div class="alert alert-danger" style="margin-bottom:10px;">This restaurant is currently closed.</div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div class="qty"><button class="qty-btn">−</button><span class="qty-val">0</span><button class="qty-btn">+</button></div>
        <button class="btn btn-disabled btn-sm">Unavailable</button>
      </div>
    </div>
  </div>
</div>

<!-- S8: ADD TO CART (inline demo) -->
<div class="screen" id="s8">
  <p style="font-size:13px;color:var(--c-text-secondary);margin-bottom:24px;">After clicking "Add to cart", a confirmation modal appears.</p>
  <div style="background:var(--c-surface-alt);border-radius:16px;padding:48px;display:flex;align-items:center;justify-content:center;min-height:400px;">
    <div class="card" style="width:460px;max-width:100%;text-align:center;padding:32px;">
      <div style="font-size:36px;margin-bottom:12px;">🛒</div>
      <h3 style="font-size:18px;font-weight:600;margin-bottom:4px;">Item added to cart!</h3>
      <p style="font-size:13px;color:var(--c-text-secondary);margin-bottom:24px;">Classic Burger × 1</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <button class="btn btn-secondary btn-full" onclick="go(7)">Continue ordering</button>
        <button class="btn btn-primary btn-full" onclick="go(9)">View cart</button>
      </div>
    </div>
  </div>
</div>

<!-- S9: CART -->
<div class="screen" id="s9">
  <h2 class="section-heading">Your cart</h2>
  <p class="section-sub">Review your items before checkout.</p>
  <div class="two-col" style="align-items:start;">
    <div>
      <div class="card-muted" style="padding:10px 14px;margin-bottom:14px;"><span style="font-size:13px;color:var(--c-text-secondary);">Ordering from: <strong style="color:var(--c-text);">Burger Palace</strong></span></div>
      <table class="data-table">
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Action</th></tr></thead>
        <tbody><tr>
          <td><div style="font-weight:500;">Classic Burger</div><div style="font-size:11px;color:var(--c-text-muted);">Beef patty, lettuce, tomato</div></td>
          <td><div class="qty"><button class="qty-btn">−</button><span class="qty-val">1</span><button class="qty-btn">+</button></div></td>
          <td style="font-weight:500;">85 EGP</td>
          <td><span style="font-size:12px;color:var(--c-danger);cursor:pointer;font-weight:500;">Remove</span></td>
        </tr></tbody>
      </table>
    </div>
    <div class="card">
      <h3 style="font-size:15px;font-weight:600;margin-bottom:14px;">Order summary</h3>
      <div class="row"><span style="font-size:13px;color:var(--c-text-secondary);">Subtotal</span><span style="font-size:13px;">85 EGP</span></div>
      <div class="row"><span style="font-size:13px;color:var(--c-text-secondary);">Delivery fee</span><span style="font-size:13px;">15 EGP</span></div>
      <div class="divider"></div>
      <div class="row"><span style="font-size:16px;font-weight:600;">Total</span><span style="font-size:16px;font-weight:600;">100 EGP</span></div>
      <button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="go(10)">Proceed to checkout</button>
    </div>
  </div>
</div>

<!-- S10: CHECKOUT -->
<div class="screen" id="s10">
  <h2 class="section-heading">Checkout</h2>
  <div class="checkout-grid">
    <div>
      <div class="card">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:14px;">Delivery address</h3>
        <div style="font-size:11px;color:var(--c-text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Saved address</div>
        <div class="address-card">
          <div class="radio-indicator"><div class="radio-dot filled"></div></div>
          <div style="font-size:13px;font-weight:600;">Home</div>
          <div style="font-size:12px;color:var(--c-text-secondary);margin-top:2px;">010 1234 5678 · Bldg 4, Apt 12, El Nasr St.</div>
        </div>
        <div class="two-col">
          <div><label class="field-label">Phone number</label><input class="field-input" placeholder="01X XXXX XXXX"></div>
          <div><label class="field-label">Building name</label><input class="field-input" placeholder="Building name"></div>
        </div>
        <div class="two-col">
          <div><label class="field-label">Apartment number</label><input class="field-input" placeholder="Apt 4B"></div>
          <div><label class="field-label">Floor</label><input class="field-input" placeholder="3rd floor"></div>
        </div>
        <div class="two-col">
          <div><label class="field-label">Street</label><input class="field-input" placeholder="El Nasr St."></div>
          <div><label class="field-label">Nearby landmark (optional)</label><input class="field-input" placeholder="Near the supermarket"></div>
        </div>
      </div>
      <div class="card">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:14px;">Loyalty & rewards</h3>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="checkbox-box"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div style="flex:1;"><div style="font-size:13px;font-weight:500;">Redeem 1000 points → 10 EGP credit</div><div style="font-size:12px;color:var(--c-text-secondary);">Available balance: 10 EGP wallet credit</div></div>
          <span class="tag tag-success" style="font-weight:700;">−10 EGP</span>
        </div>
      </div>
      <div class="card">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:14px;">Payment method</h3>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="radio-dot filled"></div>
          <span style="font-size:13px;">Cash on delivery</span>
          <span class="tag tag-success" style="margin-left:auto;">Only option</span>
        </div>
      </div>
    </div>
    <div>
      <div class="card" style="position:sticky;top:0;">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:14px;">Order summary</h3>
        <div class="row"><span style="font-size:13px;color:var(--c-text-secondary);">Subtotal</span><span>100 EGP</span></div>
        <div class="row"><span style="font-size:13px;color:var(--c-text-secondary);">Delivery fee</span><span>15 EGP</span></div>
        <div class="row"><span style="font-size:13px;color:var(--c-danger);">Points discount</span><span style="color:var(--c-danger);">−10 EGP</span></div>
        <div class="divider"></div>
        <div class="row"><span style="font-size:16px;font-weight:600;">Total</span><span style="font-size:16px;font-weight:600;">105 EGP</span></div>
        <div class="divider"></div>
        <button class="btn btn-primary btn-full" onclick="go(11)">Place order</button>
      </div>
    </div>
  </div>
</div>

<!-- S11: ORDER CONFIRMED -->
<div class="screen" id="s11">
  <div style="max-width:560px;margin:0 auto;text-align:center;padding-top:40px;">
    <div class="success-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
    <h2 style="font-size:24px;font-weight:700;margin-bottom:6px;">Order confirmed!</h2>
    <p style="font-size:14px;color:var(--c-text-secondary);margin-bottom:28px;">Your order is on its way.</p>
    <div class="card" style="text-align:left;">
      <div class="row"><span style="color:var(--c-text-secondary);">Restaurant</span><span style="font-weight:500;">Burger Palace</span></div>
      <div class="row"><span style="color:var(--c-text-secondary);">Total paid</span><span style="font-weight:500;">105 EGP</span></div>
      <div class="row"><span style="color:var(--c-text-secondary);">Payment</span><span>Cash on delivery</span></div>
      <div class="divider"></div>
      <div class="row"><span style="color:var(--c-text-secondary);">Points earned</span><span class="tag tag-success">+10 pts</span></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;">
      <button class="btn btn-secondary btn-full" onclick="go(3)">Back to home</button>
      <button class="btn btn-primary btn-full" onclick="go(16)">View loyalty</button>
    </div>
  </div>
</div>

<!-- S12: MY ACCOUNT -->
<div class="screen" id="s12">
  <h2 class="section-heading">My account</h2>
  <div class="two-col" style="align-items:start;">
    <div>
      <div class="card" style="display:flex;align-items:center;gap:14px;">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--c-accent-light);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:18px;color:var(--c-accent);flex-shrink:0;">U</div>
        <div><div style="font-size:16px;font-weight:600;">User Name</div><div style="font-size:13px;color:var(--c-text-secondary);">user@email.com</div></div>
      </div>
      <div class="card" style="padding:0 18px;">
        <div class="menu-row" onclick="go(13)"><span style="font-size:13px;">Personal info</span><span style="color:var(--c-text-muted);">›</span></div>
        <div class="menu-row" onclick="go(16)"><span style="font-size:13px;">Loyalty & rewards</span><span style="color:var(--c-text-muted);">›</span></div>
        <div class="menu-row" onclick="go(17)"><span style="font-size:13px;">Admin panel</span><span style="color:var(--c-text-muted);">›</span></div>
        <div class="menu-row" onclick="go(1)"><span style="font-size:13px;color:var(--c-danger);">Log out</span><span style="color:var(--c-text-muted);">›</span></div>
      </div>
    </div>
    <div></div>
  </div>
</div>

<!-- S13: PERSONAL INFO -->
<div class="screen" id="s13">
  <h2 class="section-heading">Personal info</h2>
  <div class="two-col" style="align-items:start;">
    <div class="card">
      <h3 style="font-size:14px;font-weight:600;margin-bottom:14px;">Profile details</h3>
      <div class="menu-row"><div><div style="font-size:12px;color:var(--c-text-secondary);">Display name</div><div style="font-size:13px;margin-top:2px;">User Name</div></div><button class="btn btn-secondary btn-sm">Edit</button></div>
      <div class="menu-row"><div><div style="font-size:12px;color:var(--c-text-secondary);">Email address</div><div style="font-size:13px;color:var(--c-text-muted);margin-top:2px;">user@email.com</div></div></div>
      <div class="menu-row"><div><div style="font-size:12px;color:var(--c-text-secondary);">Password</div><div style="font-size:13px;color:var(--c-text-muted);margin-top:2px;">••••••••</div></div></div>
      <button class="btn btn-secondary btn-full" style="margin-top:10px;" onclick="go(14)">Manage saved address ›</button>
    </div>
    <div></div>
  </div>
</div>

<!-- S14: SAVED ADDRESS -->
<div class="screen" id="s14">
  <h2 class="section-heading">Saved address</h2>
  <div class="two-col" style="align-items:start;">
    <div class="card">
      <div class="two-col">
        <div><label class="field-label">Phone number (11 digits)</label><input class="field-input" placeholder="01X XXXX XXXX"><div class="field-error" style="display:none;">Phone number must be exactly 11 digits</div></div>
        <div><label class="field-label">Building name</label><input class="field-input" placeholder="Building name"><div class="field-error" style="display:none;">This field is required</div></div>
      </div>
      <div class="two-col">
        <div><label class="field-label">Apartment number</label><input class="field-input" placeholder="Apt 4B"><div class="field-error" style="display:none;">This field is required</div></div>
        <div><label class="field-label">Floor</label><input class="field-input" placeholder="3rd floor"><div class="field-error" style="display:none;">This field is required</div></div>
      </div>
      <div class="two-col">
        <div><label class="field-label">Street</label><input class="field-input" placeholder="El Nasr St."><div class="field-error" style="display:none;">This field is required</div></div>
        <div><label class="field-label">Nearby landmark (optional)</label><input class="field-input" placeholder="Near the supermarket"></div>
      </div>
      <button class="btn btn-primary">Save address</button>
    </div>
    <div class="card-muted">
      <h4 style="font-size:13px;font-weight:600;margin-bottom:10px;">Phone number rules</h4>
      <div style="font-size:12px;color:var(--c-text-secondary);line-height:1.8;">• Exactly 11 digits (Egypt mobile)<br>• Numbers only — no letters or symbols<br>• Error: "Phone number must be exactly 11 digits"<br>• Error: "Only numbers are allowed"</div>
    </div>
  </div>
</div>

<!-- S16: LOYALTY -->
<div class="screen" id="s16">
  <h2 class="section-heading">Loyalty & rewards</h2>
  <div class="two-col" style="align-items:start;">
    <div>
      <div class="card" style="text-align:center;padding:32px;">
        <div style="font-size:52px;font-weight:700;color:var(--c-accent);">720</div>
        <div style="font-size:14px;color:var(--c-text-secondary);margin-top:4px;">Your points balance</div>
      </div>
      <div class="card-muted">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--c-text-secondary);margin-bottom:6px;"><span>Progress to redemption</span><span>720 / 1000 pts</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:72%;"></div></div>
        <div style="font-size:12px;color:var(--c-text-muted);margin-top:8px;">280 more points to redeem</div>
      </div>

    </div>
    <div class="card-muted">
      <h4 style="font-size:14px;font-weight:600;margin-bottom:14px;">How points work</h4>
      <div style="font-size:13px;color:var(--c-text-secondary);line-height:2;">
        <strong style="color:var(--c-text);">Earn:</strong> 0.1 point per 1 EGP spent<br>
        <strong style="color:var(--c-text);">Rounding:</strong> Decimals rounded down<br>
        <strong style="color:var(--c-text);">Start:</strong> Points begin at 0, never negative<br>
        <strong style="color:var(--c-text);">Redeem:</strong> 1000 pts = 10 EGP credit<br><br>
        Example: 250 EGP order → 25 pts earned
      </div>
    </div>
  </div>
</div>

<!-- S17: ADMIN PANEL -->
<div class="screen" id="s17">
  <h2 class="section-heading">Admin panel</h2>
  <div class="card" style="margin-bottom:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
      <h3 style="font-size:15px;font-weight:600;">Restaurants</h3>
      <button class="btn btn-primary btn-sm" onclick="adminApi.openRestModal()">+ Add restaurant</button>
    </div>
    <table class="data-table">
      <thead><tr><th>Name</th><th>Working hours</th><th>Rating</th><th>Actions</th></tr></thead>
      <tbody>
        <tr><td style="font-weight:500;">Burger Palace</td><td style="color:var(--c-text-secondary);">9:00 am – 11:00 pm</td><td><span class="star">★</span> 4.7</td><td><div style="display:flex;gap:8px;"><button class="btn btn-secondary btn-sm" onclick="adminApi.openRestModal()">Edit</button><button class="btn btn-danger btn-sm">Delete</button></div></td></tr>
        <tr><td style="font-weight:500;">Pizza Roma</td><td style="color:var(--c-text-secondary);">10:00 am – 12:00 am</td><td><span class="star">★</span> 4.5</td><td><div style="display:flex;gap:8px;"><button class="btn btn-secondary btn-sm" onclick="adminApi.openRestModal()">Edit</button><button class="btn btn-danger btn-sm">Delete</button></div></td></tr>
      </tbody>
    </table>
  </div>
  <div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
      <h3 style="font-size:15px;font-weight:600;">Promotions</h3>
      <div style="display:flex;gap:8px;"><button class="btn btn-primary btn-sm" onclick="adminApi.openOfferModal()">+ Add</button><button class="btn btn-secondary btn-sm">Edit</button></div>
    </div>
    <table class="data-table">
      <thead><tr><th>Item</th><th>Restaurant</th><th>Discount</th><th>Expires</th></tr></thead>
      <tbody>
        <tr><td style="font-weight:500;">Classic Burger</td><td style="color:var(--c-text-secondary);">Burger Palace</td><td><span class="tag tag-warn">−20%</span></td><td style="color:var(--c-text-muted);">2 days</td></tr>
        <tr><td style="font-weight:500;">Pepperoni Pizza</td><td style="color:var(--c-text-secondary);">Pizza Roma</td><td><span class="tag tag-danger">−15%</span></td><td style="color:var(--c-text-muted);">1 day</td></tr>
      </tbody>
    </table>
  </div>
</div>
`;
