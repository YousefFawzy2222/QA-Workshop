// Remaining screen HTML templates injected into DOM
// Dynamic screens (S7,S9,S10,S11,S12,S13,S16) are empty containers — filled by shop.js
const ph = document.getElementById('screens-placeholder');
ph.innerHTML = `

<!-- S7: RESTAURANT MENU (dynamic — filled by shopApi.loadRestaurant) -->
<div class="screen" id="s7">
  <div class="empty-state" style="padding:60px;text-align:center;color:var(--c-text-secondary)">Select a restaurant to view its menu</div>
</div>

<!-- S8: ADD TO CART — no longer used, cart is handled inline -->
<div class="screen" id="s8"></div>

<!-- S9: CART (dynamic — filled by shopApi.renderCart) -->
<div class="screen" id="s9">
  <h2 class="section-heading">Your cart</h2>
  <div class="empty-state" style="padding:60px;text-align:center;"><div style="font-size:48px;margin-bottom:12px;">🛒</div><h3>Loading cart...</h3></div>
</div>

<!-- S10: CHECKOUT (dynamic — filled by shopApi.renderCheckout) -->
<div class="screen" id="s10">
  <h2 class="section-heading">Checkout</h2>
  <div class="empty-state" style="padding:40px;text-align:center;color:var(--c-text-secondary)">Loading checkout...</div>
</div>

<!-- S11: ORDER CONFIRMED (dynamic — filled by shopApi.renderConfirmed) -->
<div class="screen" id="s11">
  <div class="empty-state" style="padding:60px;text-align:center;color:var(--c-text-secondary)">No recent order</div>
</div>

<!-- S12: MY ACCOUNT (dynamic — filled by shopApi.renderAccount) -->
<div class="screen" id="s12">
  <h2 class="section-heading">My account</h2>
  <div class="empty-state" style="padding:40px;text-align:center;color:var(--c-text-secondary)">Loading...</div>
</div>

<!-- S13: PERSONAL INFO (dynamic — filled by shopApi.renderPersonalInfo) -->
<div class="screen" id="s13">
  <h2 class="section-heading">Personal info</h2>
  <div class="empty-state" style="padding:40px;text-align:center;color:var(--c-text-secondary)">Loading...</div>
</div>

<!-- S14: SAVED ADDRESS (kept as form — managed by address.js) -->
<div class="screen" id="s14">
  <h2 class="section-heading">Saved address</h2>
  <div class="two-col" style="align-items:start;">
    <div class="card">
      <div class="two-col">
        <div><label class="field-label">Phone number (11 digits)</label><input class="field-input" placeholder="01X XXXX XXXX"><div class="field-error" style="display:none;">Phone number must be exactly 11 digits</div></div>
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
      <button class="btn btn-primary">Save address</button>
    </div>
    <div class="card-muted">
      <h4 style="font-size:13px;font-weight:600;margin-bottom:10px;">Phone number rules</h4>
      <div style="font-size:12px;color:var(--c-text-secondary);line-height:1.8;">• Exactly 11 digits (Egypt mobile)<br>• Numbers only — no letters or symbols</div>
    </div>
  </div>
</div>

<!-- S16: LOYALTY (dynamic — filled by shopApi.renderLoyalty) -->
<div class="screen" id="s16">
  <h2 class="section-heading">Loyalty & rewards</h2>
  <div class="empty-state" style="padding:40px;text-align:center;color:var(--c-text-secondary)">Loading...</div>
</div>

<!-- S17: ADMIN PANEL (managed by admin.js) -->
<div class="screen" id="s17">
  <h2 class="section-heading">Admin panel</h2>
  <div class="card" style="margin-bottom:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
      <h3 style="font-size:15px;font-weight:600;">Restaurants</h3>
      <button class="btn btn-primary btn-sm" onclick="adminApi.openRestModal()">+ Add restaurant</button>
    </div>
    <table class="data-table">
      <thead><tr><th>Name</th><th>Working hours</th><th>Rating</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="4" style="text-align:center;color:var(--c-text-secondary);padding:20px;">Loading...</td></tr></tbody>
    </table>
  </div>
  <div class="card" style="margin-bottom:20px;" id="admin-items-section">
    <!-- Filled dynamically by adminApi.renderItemsSection() -->
  </div>
  <div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
      <h3 style="font-size:15px;font-weight:600;">Promotions</h3>
      <div style="display:flex;gap:8px;"><button class="btn btn-primary btn-sm" onclick="adminApi.openOfferModal()">+ Add</button></div>
    </div>
    <table class="data-table">
      <thead><tr><th>Item</th><th>Restaurant</th><th>Discount</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="4" style="text-align:center;color:var(--c-text-secondary);padding:20px;">Loading...</td></tr></tbody>
    </table>
  </div>
</div>
`;
