const adminApi = {
  // --- Restaurants API ---
  async getRestaurants() { return apiClient.get('/admin/restaurants'); },
  async addRestaurant(data) { return apiClient.post('/admin/restaurants', data); },
  async updateRestaurant(id, data) { return apiClient.put(`/admin/restaurants/${id}`, data); },
  async deleteRestaurant(id) { return apiClient.delete(`/admin/restaurants/${id}`); },

  // --- Offers/Promotions API ---
  async getOffers() { return apiClient.get('/offers'); },
  async addOffer(data) { return apiClient.post('/offers', data); },
  async updateOffer(id, data) { return apiClient.put(`/offers/${id}`, data); },
  async deleteOffer(id) { return apiClient.delete(`/offers/${id}`); },

  // --- State ---
  restaurants: [],
  offers: [],
  editingRestaurantId: null,
  editingOfferId: null,

  async load() {
    try {
      const resRest = await this.getRestaurants();
      if (resRest.ok) {
        this.restaurants = resRest.data.restaurants || [];
        this.renderRestaurants();
        // Delegate items rendering to the items module
        if (window.itemsApi) itemsApi.renderSection(this.restaurants);
      }
    } catch (err) { console.error('Failed to load restaurants:', err); }

    try {
      const resOff = await this.getOffers();
      if (resOff.ok) {
        this.offers = resOff.data.offers || [];
        this.renderOffers();
      }
    } catch (err) { console.error('Failed to load offers:', err); }
  },

  renderRestaurants() {
    const tbody = document.querySelector('#s17 .data-table:nth-of-type(1) tbody');
    if (!tbody) return;
    if (this.restaurants.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--c-text-secondary);padding:20px;">No restaurants</td></tr>`;
      return;
    }
    tbody.innerHTML = this.restaurants.map(rest => `
      <tr>
        <td style="font-weight:500;">${rest.restName || rest.name}</td>
        <td style="color:var(--c-text-secondary);">${rest.openTime} – ${rest.closeTime}</td>
        <td><span class="star">★</span> ${rest.restRate || rest.rating || 0}</td>
        <td>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="if(window.itemsApi){itemsApi.selectedRestaurantId=${rest.id};itemsApi.renderSection(adminApi.restaurants);itemsApi.loadItems(${rest.id});document.getElementById('admin-items-section').scrollIntoView({behavior:'smooth'});}">Items</button>
            <button class="btn btn-secondary btn-sm" onclick="adminApi.openRestModal(${rest.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="adminApi.handleDeleteRest(${rest.id})">Delete</button>
          </div>
        </td>
      </tr>`).join('');
  },

  renderOffers() {
    const tables = document.querySelectorAll('#s17 .data-table');
    if (tables.length < 3) return;
    const tbody = tables[2].querySelector('tbody');
    if (!tbody) return;
    if (this.offers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--c-text-secondary);padding:20px;">No promotions</td></tr>`;
      return;
    }
    tbody.innerHTML = this.offers.map(off => `
      <tr>
        <td style="font-weight:500;">${off.offerName}</td>
        <td style="color:var(--c-text-secondary);">Item ID: ${off.menuItemId}</td>
        <td><span class="tag tag-warn">-${off.discountPercentage}%</span></td>
        <td>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="adminApi.openOfferModal(${off.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="adminApi.handleDeleteOffer(${off.id})">Delete</button>
          </div>
        </td>
      </tr>`).join('');
  },

  // --- Restaurant Modal ---
  openRestModal(id = null) {
    this.editingRestaurantId = id;
    const modal = document.getElementById('adminRestModal');
    const title = document.getElementById('adminRestTitle');
    if (id) {
      const rest = this.restaurants.find(r => r.id === id);
      title.textContent = 'Edit Restaurant';
      document.getElementById('restName').value = rest.restName || rest.name;
      document.getElementById('restLocation').value = rest.restLocation || rest.location;
      document.getElementById('restDeliveryTime').value = rest.restMaxDeliveryTime || rest.deliveryTime;
      document.getElementById('restDeliveryPrice').value = rest.restDeliveryCost || rest.deliveryPrice;
      document.getElementById('restOpenTime').value = rest.openTime;
      document.getElementById('restCloseTime').value = rest.closeTime;
    } else {
      title.textContent = 'Add Restaurant';
      document.getElementById('adminRestForm').reset();
    }
    modal.style.display = 'flex';
  },
  closeRestModal() { document.getElementById('adminRestModal').style.display = 'none'; },

  async submitRestForm(e) {
    e.preventDefault();
    const nameVal = document.getElementById('restName').value.trim();
    // TC-ADM-11: Validate empty restaurant name
    if (!nameVal) {
      const nameInput = document.getElementById('restName');
      nameInput.style.border = '2px solid var(--c-danger)';
      let errEl = document.getElementById('restNameError');
      if (!errEl) {
        errEl = document.createElement('div');
        errEl.id = 'restNameError';
        errEl.style.cssText = 'color:var(--c-danger);font-size:12px;margin-top:4px;';
        nameInput.parentNode.insertBefore(errEl, nameInput.nextSibling);
      }
      errEl.textContent = 'Restaurant Name is required.';
      return;
    }
    // Clear previous errors
    const nameInput = document.getElementById('restName');
    nameInput.style.border = '';
    const errEl = document.getElementById('restNameError');
    if (errEl) errEl.remove();

    const data = {
      restName: nameVal,
      name: nameVal,
      restLocation: document.getElementById('restLocation').value,
      location: document.getElementById('restLocation').value,
      restMaxDeliveryTime: Number(document.getElementById('restDeliveryTime').value),
      restMinDeliveryTime: Number(document.getElementById('restDeliveryTime').value),
      deliveryTime: Number(document.getElementById('restDeliveryTime').value),
      restDeliveryCost: Number(document.getElementById('restDeliveryPrice').value),
      deliveryPrice: Number(document.getElementById('restDeliveryPrice').value),
      openTime: document.getElementById('restOpenTime').value,
      closeTime: document.getElementById('restCloseTime').value,
    };
    let res;
    if (this.editingRestaurantId) res = await this.updateRestaurant(this.editingRestaurantId, data);
    else res = await this.addRestaurant(data);
    if (res.ok) { this.closeRestModal(); this.load(); }
    else alert('Error: ' + res.data.error);
  },

  async handleDeleteRest(id) {
    if (confirm('Delete this restaurant?')) {
      const res = await this.deleteRestaurant(id);
      if (res.ok) this.load();
      else alert('Failed: ' + res.data.error);
    }
  },

  // --- Offer Modal ---
  async openOfferModal(id = null) {
    this.editingOfferId = id;
    const modal = document.getElementById('adminOfferModal');
    const title = document.getElementById('adminOfferTitle');

    // TC-ADM-08: Populate item dropdown with actual menu items from all restaurants
    const itemSelect = document.getElementById('offItemId');
    if (itemSelect && itemSelect.tagName === 'SELECT') {
      itemSelect.innerHTML = '<option value="">-- Select an item --</option>';
      for (const rest of this.restaurants) {
        try {
          const itemsRes = await apiClient.get(`/admin/restaurants/${rest.id}/items`);
          if (itemsRes.ok) {
            const items = itemsRes.data.items || [];
            items.forEach(it => {
              const opt = document.createElement('option');
              opt.value = it.id;
              opt.textContent = `${it.itemName} (${rest.restName}) — ${it.itemCost} EGP`;
              itemSelect.appendChild(opt);
            });
          }
        } catch(e) {}
      }
    }

    if (id) {
      const off = this.offers.find(o => o.id === id);
      title.textContent = 'Edit Promotion';
      document.getElementById('offName').value = off.offerName || '';
      document.getElementById('offItemId').value = off.menuItemId;
      document.getElementById('offDiscount').value = off.discountPercentage;
      document.getElementById('offStart').value = off.startsAt || '';
      document.getElementById('offEnd').value = off.expiresAt || '';
    } else {
      title.textContent = 'Add Promotion';
      document.getElementById('offName').value = '';
      document.getElementById('offDiscount').value = '';
      document.getElementById('offStart').value = '';
      document.getElementById('offEnd').value = '';
    }
    modal.style.display = 'flex';
  },
  closeOfferModal() { document.getElementById('adminOfferModal').style.display = 'none'; },

  async submitOfferForm(e) {
    e.preventDefault();
    const data = {
      offerName: document.getElementById('offName').value,
      menuItemId: Number(document.getElementById('offItemId').value),
      discountPercentage: Number(document.getElementById('offDiscount').value),
      startsAt: document.getElementById('offStart').value,
      expiresAt: document.getElementById('offEnd').value,
    };
    if (!data.menuItemId) { alert('Please select a menu item.'); return; }
    if (!data.discountPercentage || data.discountPercentage < 1 || data.discountPercentage > 100) { alert('Discount must be between 1-100%.'); return; }
    let res;
    if (this.editingOfferId) res = await this.updateOffer(this.editingOfferId, data);
    else res = await this.addOffer(data);
    if (res.ok) { this.closeOfferModal(); this.load(); }
    else alert('Error: ' + (res.data?.error || 'Unknown error'));
  },

  async handleDeleteOffer(id) {
    if (confirm('Delete this promotion?')) {
      const res = await this.deleteOffer(id);
      if (res.ok) this.load();
      else alert('Failed: ' + res.data.error);
    }
  }
};

window.adminApi = adminApi;

// Inject Restaurant & Offer Modals into DOM
function injectAdminModals() {
  const modalHTML = `
    <!-- Restaurant Modal -->
    <div class="modal-overlay" id="adminRestModal" style="display:none; align-items:center; justify-content:center; z-index:9999;">
      <div class="modal-box" style="width: 100%; max-width: 500px; padding: 24px; text-align: left;">
        <h3 id="adminRestTitle" style="margin-bottom:16px;">Add Restaurant</h3>
        <form id="adminRestForm">
          <label class="field-label">Name</label><input class="field-input" id="restName">
          <label class="field-label">Location</label><input class="field-input" id="restLocation" required>
          <div style="display:flex;gap:10px;">
            <div style="flex:1"><label class="field-label">Delivery Time (min)</label><input type="number" class="field-input" id="restDeliveryTime" required></div>
            <div style="flex:1"><label class="field-label">Delivery Price</label><input type="number" step="0.5" class="field-input" id="restDeliveryPrice" required></div>
          </div>
          <div style="display:flex;gap:10px;">
            <div style="flex:1"><label class="field-label">Open Time</label><input type="time" class="field-input" id="restOpenTime" required></div>
            <div style="flex:1"><label class="field-label">Close Time</label><input type="time" class="field-input" id="restCloseTime" required></div>
          </div>
          <div style="display:flex;gap:10px;margin-top:20px;">
            <button type="button" class="btn btn-secondary btn-full" onclick="adminApi.closeRestModal()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-full">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Offer Modal -->
    <div class="modal-overlay" id="adminOfferModal" style="display:none; align-items:center; justify-content:center; z-index:9999;">
      <div class="modal-box" style="width: 100%; max-width: 500px; padding: 24px; text-align: left;">
        <h3 id="adminOfferTitle" style="margin-bottom:16px;">Add Promotion</h3>
        <form id="adminOfferForm">
          <label class="field-label">Offer Name</label><input class="field-input" id="offName" required>
          <div style="display:flex;gap:10px;">
            <div style="flex:1"><label class="field-label">Menu Item</label><select class="field-input" id="offItemId" required><option value="">Loading items...</option></select></div>
            <div style="flex:1"><label class="field-label">Discount %</label><input type="number" min="1" max="100" class="field-input" id="offDiscount" required></div>
          </div>
          <div style="display:flex;gap:10px;">
            <div style="flex:1"><label class="field-label">Starts At</label><input type="date" class="field-input" id="offStart" required></div>
            <div style="flex:1"><label class="field-label">Expires At</label><input type="date" class="field-input" id="offEnd" required></div>
          </div>
          <div style="display:flex;gap:10px;margin-top:20px;">
            <button type="button" class="btn btn-secondary btn-full" onclick="adminApi.closeOfferModal()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-full">Save</button>
          </div>
        </form>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('adminRestForm').addEventListener('submit', (e) => adminApi.submitRestForm(e));
  document.getElementById('adminOfferForm').addEventListener('submit', (e) => adminApi.submitOfferForm(e));
}

injectAdminModals();

document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.target.id === 's17' && m.target.classList.contains('active')) adminApi.load();
    }
  });
  const s17 = document.getElementById('s17');
  if (s17) {
    observer.observe(s17, { attributes: true, attributeFilter: ['class'] });
    if (s17.classList.contains('active')) adminApi.load();
  }
});
