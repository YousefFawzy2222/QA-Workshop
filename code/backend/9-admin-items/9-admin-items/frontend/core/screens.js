// Remaining screen HTML templates injected into DOM
const ph = document.getElementById('screens-placeholder');
ph.innerHTML = `

<!-- S7: RESTAURANT MENU -->
<div class="screen" id="s7">
  <div style="display:flex;align-items:flex-end;gap:20px;margin-bottom:28px;">
    <div class="skeleton" style="width:120px;height:120px;border-radius:14px;"></div>
    <div style="flex:1;">
      <div class="skeleton skeleton-title" style="margin-left:0;width:40%;"></div>
      <div class="skeleton skeleton-text" style="margin-left:0;width:60%;"></div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="two-col">
    <div class="skeleton-menu-item"><div class="skeleton skeleton-menu-img"></div><div class="skeleton-menu-content"><div class="skeleton skeleton-title" style="margin-left:0;width:60%;"></div><div class="skeleton skeleton-text" style="margin-left:0;width:90%;"></div></div></div>
    <div class="skeleton-menu-item"><div class="skeleton skeleton-menu-img"></div><div class="skeleton-menu-content"><div class="skeleton skeleton-title" style="margin-left:0;width:60%;"></div><div class="skeleton skeleton-text" style="margin-left:0;width:90%;"></div></div></div>
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
  <div id="cart-content"></div>
</div>

<!-- S10: CHECKOUT -->
<div class="screen" id="s10">
  <h2 class="section-heading">Checkout</h2>
  <div class="checkout-grid">
    <div>
      <div class="card"><h3 style="font-size:14px;font-weight:600;margin-bottom:14px;">Delivery address</h3><div class="skeleton skeleton-text" style="width:80%;height:40px;"></div></div>
      <div class="card"><h3 style="font-size:14px;font-weight:600;margin-bottom:14px;">Loyalty</h3><div class="skeleton skeleton-text" style="width:50%;"></div></div>
    </div>
    <div class="card"><h3 style="font-size:15px;font-weight:600;margin-bottom:14px;">Order summary</h3><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div></div>
  </div>
</div>

<!-- S11: ORDER CONFIRMED -->
<div class="screen" id="s11">
  <div style="max-width:560px;margin:0 auto;text-align:center;padding-top:40px;">
    <div class="success-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
    <h2 style="font-size:24px;font-weight:700;margin-bottom:6px;">Order confirmed!</h2>
    <p style="font-size:14px;color:var(--c-text-secondary);margin-bottom:28px;">Your order is on its way.</p>
    <div class="card" id="order-confirm-details" style="text-align:left;">
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
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
        <div style="width:52px;height:52px;border-radius:50%;background:var(--c-accent-light);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:18px;color:var(--c-accent);flex-shrink:0;" id="user-avatar-char">?</div>
        <div><div style="font-size:16px;font-weight:600;" id="user-name-display">Loading...</div><div style="font-size:13px;color:var(--c-text-secondary);" id="user-email-display">...</div></div>
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
        <div style="font-size:52px;font-weight:700;color:var(--c-accent);" id="loyalty-balance-big">...</div>
        <div style="font-size:14px;color:var(--c-text-secondary);margin-top:4px;">Your points balance</div>
      </div>
      <div class="card-muted" id="loyalty-progress-card">
        <div class="skeleton skeleton-text"></div>
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
      <tbody><tr><td colspan="4" style="text-align:center;padding:20px;"><div class="skeleton skeleton-text"></div></td></tr></tbody>
    </table>
  </div>
  <div id="admin-items-section"></div>
  <div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
      <h3 style="font-size:15px;font-weight:600;">Promotions</h3>
      <button class="btn btn-primary btn-sm" onclick="adminApi.openOfferModal()">+ Add</button>
    </div>
    <table class="data-table">
      <thead><tr><th>Item</th><th>Details</th><th>Discount</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="4" style="text-align:center;padding:20px;"><div class="skeleton skeleton-text"></div></td></tr></tbody>
    </table>
  </div>
</div>
`;
