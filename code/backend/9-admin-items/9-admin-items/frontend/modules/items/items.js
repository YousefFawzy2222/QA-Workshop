// ═══════════════════════════════════════════
// Items Module — Admin CRUD for menu items
// ═══════════════════════════════════════════

const itemsApi = {
  // --- API ---
  async getItems(restId) { return apiClient.get(`/admin/restaurants/${restId}/items`); },
  async addItem(restId, data) { return apiClient.post(`/admin/restaurants/${restId}/items`, data); },
  async updateItem(restId, id, data) { return apiClient.put(`/admin/restaurants/${restId}/items/${id}`, data); },
  async deleteItem(restId, id) { return apiClient.delete(`/admin/restaurants/${restId}/items/${id}`); },

  // --- State ---
  items: [],
  editingItemId: null,
  selectedRestaurantId: null,

  // Render the items section inside admin panel
  renderSection(restaurants) {
    const container = document.getElementById('admin-items-section');
    if (!container) return;
    const opts = restaurants.map(r =>
      `<option value="${r.id}" ${r.id === this.selectedRestaurantId ? 'selected' : ''}>${r.restName || r.name}</option>`
    ).join('');

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <h3 style="font-size:15px;font-weight:600;">Menu Items</h3>
        <div style="display:flex;gap:8px;align-items:center;">
          <select class="field-input" style="width:auto;min-width:180px;padding:6px 10px;font-size:13px;" id="item-rest-selector" onchange="itemsApi.onSelectRestaurant(this.value)">
            <option value="">Select restaurant...</option>
            ${opts}
          </select>
          <button class="btn btn-primary btn-sm" onclick="itemsApi.openModal()" ${this.selectedRestaurantId ? '' : 'disabled'}>+ Add item</button>
        </div>
      </div>
      <table class="data-table">
        <thead><tr><th>Name</th><th>Price</th><th>Size</th><th>Qty</th><th>Discount</th><th>Actions</th></tr></thead>
        <tbody id="items-tbody">
          <tr><td colspan="6" style="text-align:center;color:var(--c-text-secondary);padding:20px;">Select a restaurant to see its items</td></tr>
        </tbody>
      </table>`;

    if (this.selectedRestaurantId) this.loadItems(this.selectedRestaurantId);
  },

  async onSelectRestaurant(id) {
    this.selectedRestaurantId = id ? parseInt(id) : null;
    const addBtn = document.querySelector('#admin-items-section .btn-primary');
    if (addBtn) addBtn.disabled = !this.selectedRestaurantId;
    if (this.selectedRestaurantId) {
      await this.loadItems(this.selectedRestaurantId);
    } else {
      document.getElementById('items-tbody').innerHTML =
        `<tr><td colspan="6" style="text-align:center;color:var(--c-text-secondary);padding:20px;">Select a restaurant</td></tr>`;
    }
  },

  async loadItems(restId) {
    const tbody = document.getElementById('items-tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;">Loading...</td></tr>`;

    const res = await this.getItems(restId);
    if (res.ok) {
      this.items = res.data.items || [];
      if (this.items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--c-text-secondary);padding:20px;">No items for this restaurant</td></tr>`;
        return;
      }
      tbody.innerHTML = this.items.map(item => `
        <tr>
          <td style="font-weight:500;">${item.itemName}</td>
          <td>${item.itemCost} EGP</td>
          <td style="color:var(--c-text-secondary);">${item.itemSize || '-'}</td>
          <td>${item.itemQuantity}</td>
          <td>${item.isOnDiscount ? `<span class="tag tag-warn">-${item.discountPercentage}%</span>` : '<span style="color:var(--c-text-muted)">—</span>'}</td>
          <td>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="itemsApi.openModal(${item.id})">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="itemsApi.handleDelete(${item.id})">Delete</button>
            </div>
          </td>
        </tr>`).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--c-danger);padding:20px;">Failed to load items</td></tr>`;
    }
  },

  // --- Modal ---
  openModal(id = null) {
    if (!this.selectedRestaurantId) { alert('Select a restaurant first'); return; }
    this.editingItemId = id;
    const modal = document.getElementById('adminItemModal');
    const title = document.getElementById('adminItemTitle');

    if (id) {
      const item = this.items.find(i => i.id === id);
      title.textContent = 'Edit Item';
      document.getElementById('itemName').value = item.itemName;
      document.getElementById('itemCost').value = item.itemCost;
      document.getElementById('itemQty').value = item.itemQuantity;
      document.getElementById('itemSize').value = item.itemSize || '';
      document.getElementById('itemDesc').value = item.description || '';
      document.getElementById('itemIsCombo').checked = item.isCombo;
      document.getElementById('itemOnDiscount').checked = item.isOnDiscount;
      document.getElementById('itemDiscountPct').value = item.discountPercentage || 0;
      document.getElementById('item-discount-row').style.display = item.isOnDiscount ? 'block' : 'none';
    } else {
      title.textContent = 'Add Item';
      document.getElementById('adminItemForm').reset();
      document.getElementById('item-discount-row').style.display = 'none';
    }
    modal.style.display = 'flex';
  },

  closeModal() {
    document.getElementById('adminItemModal').style.display = 'none';
  },

  async submitForm(e) {
    e.preventDefault();
    const data = {
      itemName: document.getElementById('itemName').value,
      itemCost: parseFloat(document.getElementById('itemCost').value),
      itemQuantity: parseInt(document.getElementById('itemQty').value),
      itemSize: document.getElementById('itemSize').value,
      description: document.getElementById('itemDesc').value,
      isCombo: document.getElementById('itemIsCombo').checked,
      isOnDiscount: document.getElementById('itemOnDiscount').checked,
      discountPercentage: parseFloat(document.getElementById('itemDiscountPct').value) || 0,
      restaurantId: this.selectedRestaurantId
    };

    let res;
    if (this.editingItemId) {
      res = await this.updateItem(this.selectedRestaurantId, this.editingItemId, data);
    } else {
      res = await this.addItem(this.selectedRestaurantId, data);
    }

    if (res.ok) {
      this.closeModal();
      this.loadItems(this.selectedRestaurantId);
    } else {
      alert('Error: ' + (res.data?.error || 'Unknown'));
    }
  },

  async handleDelete(id) {
    if (confirm('Delete this item?')) {
      const res = await this.deleteItem(this.selectedRestaurantId, id);
      if (res.ok) this.loadItems(this.selectedRestaurantId);
      else alert('Failed: ' + (res.data?.error || ''));
    }
  }
};

window.itemsApi = itemsApi;

// Inject Item Modal into DOM
(function injectItemModal() {
  const modalHTML = `
    <div class="modal-overlay" id="adminItemModal" style="display:none; align-items:center; justify-content:center; z-index:9999;">
      <div class="modal-box" style="width: 100%; max-width: 520px; padding: 24px; text-align: left;">
        <h3 id="adminItemTitle" style="margin-bottom:16px;">Add Item</h3>
        <form id="adminItemForm">
          <label class="field-label">Item Name</label>
          <input class="field-input" id="itemName" required>
          <label class="field-label">Description</label>
          <input class="field-input" id="itemDesc">
          <div style="display:flex;gap:10px;">
            <div style="flex:1"><label class="field-label">Price (EGP)</label><input type="number" step="0.01" class="field-input" id="itemCost" required></div>
            <div style="flex:1"><label class="field-label">Quantity</label><input type="number" class="field-input" id="itemQty" value="100" required></div>
          </div>
          <div style="display:flex;gap:10px;">
            <div style="flex:1"><label class="field-label">Size</label><input class="field-input" id="itemSize" placeholder="Regular, Large..." required></div>
            <div style="flex:1;display:flex;align-items:end;gap:16px;padding-bottom:8px;">
              <label style="font-size:13px;display:flex;align-items:center;gap:6px;"><input type="checkbox" id="itemIsCombo"> Combo</label>
              <label style="font-size:13px;display:flex;align-items:center;gap:6px;"><input type="checkbox" id="itemOnDiscount" onchange="document.getElementById('item-discount-row').style.display=this.checked?'block':'none'"> On Discount</label>
            </div>
          </div>
          <div id="item-discount-row" style="display:none;">
            <label class="field-label">Discount %</label>
            <input type="number" min="1" max="100" class="field-input" id="itemDiscountPct" value="0">
          </div>
          <div style="display:flex;gap:10px;margin-top:20px;">
            <button type="button" class="btn btn-secondary btn-full" onclick="itemsApi.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-full">Save</button>
          </div>
        </form>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('adminItemForm').addEventListener('submit', (e) => itemsApi.submitForm(e));
})();
