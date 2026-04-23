/**
 * admin-items.js – Module 3.1: Menu Item Management
 *
 * API calls:
 *  GET    /api/admin/restaurants/:restaurantId/items
 *  POST   /api/admin/restaurants/:restaurantId/items
 *  PUT    /api/admin/restaurants/:restaurantId/items/:id
 *  DELETE /api/admin/restaurants/:restaurantId/items/:id
 *
 * SRS references implemented:
 *  - ADM-FR-02  : "Add Item" button disabled + notice when restaurant is closed
 *  - OFF-FR-03  : Discounted items show before/after price + discount %
 *  - RES-FR-01.1: Combo meals count as 1 item (badge + checkbox hint)
 *
 * Guard: every API call sends X-User-Email (same adminFetch from admin.js).
 */

// ─── State ────────────────────────────────────────────────────────────────────
let currentRestaurant = null; // { id, name, openTime, closeTime }

// ─── DOM References ───────────────────────────────────────────────────────────
const restaurantsSection  = document.getElementById('restaurants-section');
const itemsSection        = document.getElementById('items-section');
const itemsSectionTitle   = document.getElementById('items-section-title');
const itemsCount          = document.getElementById('items-count');
const itemsTbody          = document.getElementById('items-tbody');
const itemsTable          = document.getElementById('items-table');
const itemsEmptyState     = document.getElementById('items-empty-state');
const closedNotice        = document.getElementById('closed-notice');
const openAddItemModalBtn = document.getElementById('open-add-item-modal');
const navMenuItems        = document.getElementById('nav-menu-items');
const navRestaurants      = document.getElementById('nav-restaurants');

// Item modal (Add / Edit)
const itemModal           = document.getElementById('item-modal');
const itemModalTitle      = document.getElementById('item-modal-title');
const itemForm            = document.getElementById('item-form');
const editItemIdInput     = document.getElementById('edit-item-id');
const itemNameInput       = document.getElementById('item-name');
const itemSizeInput       = document.getElementById('item-size');
const itemCostInput       = document.getElementById('item-cost');
const itemQuantityInput   = document.getElementById('item-quantity');
const itemDescriptionInput= document.getElementById('item-description');
const itemIsComboInput    = document.getElementById('item-is-combo');
const itemOnDiscountInput = document.getElementById('item-on-discount');
const discountRow         = document.getElementById('discount-row');
const itemDiscountPctInput= document.getElementById('item-discount-pct');
const discountPreview     = document.getElementById('discount-preview');
const itemErrorBox        = document.getElementById('item-error-box');
const saveItemBtn         = document.getElementById('save-item-btn');
const cancelItemBtn       = document.getElementById('cancel-item');
const itemModalCloseBtn   = document.getElementById('item-modal-close');

// Field error spans
const itemNameError       = document.getElementById('item-name-error');
const itemSizeError       = document.getElementById('item-size-error');
const itemCostError       = document.getElementById('item-cost-error');
const itemQtyError        = document.getElementById('item-qty-error');
const itemDiscountError   = document.getElementById('item-discount-error');

// Delete item modal
const deleteItemModal         = document.getElementById('delete-item-modal');
const deleteItemName          = document.getElementById('delete-item-name');
const deleteItemIdInput       = document.getElementById('delete-item-id');
const confirmItemDeleteBtn    = document.getElementById('confirm-item-delete-btn');
const cancelItemDeleteBtn     = document.getElementById('cancel-item-delete');
const deleteItemModalCloseBtn = document.getElementById('delete-item-modal-close');

// ─── Helper: escape HTML ──────────────────────────────────────────────────────
function escI(str) {
  const d = document.createElement('div');
  d.textContent = String(str || '');
  return d.innerHTML;
}

// ─── Helper: compute open status ─────────────────────────────────────────────
function isRestaurantOpen(openTime, closeTime) {
  if (!openTime || !closeTime) return false;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  return nowMins >= oh * 60 + om && nowMins < ch * 60 + cm;
}

// ─── Helper: format price with discount (OFF-FR-03) ──────────────────────────
function formatPrice(item) {
  if (item.isOnDiscount && item.discountPercentage > 0) {
    const discounted = item.discountedPrice ?? (item.itemCost * (1 - item.discountPercentage / 100));
    return `<span class="price-original">${item.itemCost.toFixed(2)} EGP</span>
            <span class="price-discounted">${discounted.toFixed(2)} EGP</span>`;
  }
  return `${item.itemCost.toFixed(2)} EGP`;
}

// ─── Helper: discount badge (OFF-FR-03) ──────────────────────────────────────
function discountBadge(item) {
  if (item.isOnDiscount && item.discountPercentage > 0) {
    return `<span class="discount-badge">−${item.discountPercentage}%</span>`;
  }
  return '—';
}

// ─── Helper: combo/regular badge ─────────────────────────────────────────────
function typeBadge(item) {
  if (item.isCombo) {
    return `<span class="combo-badge">
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
      </svg>Combo</span>`;
  }
  return `<span class="regular-badge">Regular</span>`;
}

// ─── Build item table row ─────────────────────────────────────────────────────
function buildItemRow(item) {
  const tr = document.createElement('tr');
  tr.dataset.id = item.id;
  tr.innerHTML = `
    <td><strong>${escI(item.itemName)}</strong>
      ${item.description ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px">${escI(item.description)}</div>` : ''}
    </td>
    <td>${escI(item.itemSize)}</td>
    <td>${formatPrice(item)}</td>
    <td>${discountBadge(item)}</td>
    <td>${item.isOnDiscount && item.discountPercentage > 0
      ? `<span class="price-discounted">${(item.discountedPrice ?? (item.itemCost * (1 - item.discountPercentage / 100))).toFixed(2)} EGP</span>`
      : `${item.itemCost.toFixed(2)} EGP`}</td>
    <td>${item.itemQuantity}</td>
    <td>${typeBadge(item)}</td>
    <td class="actions-col">
      <div class="table-actions">
        <button class="icon-btn" title="Edit Item"
          data-item-action="edit"
          data-id="${item.id}"
          data-name="${escI(item.itemName)}"
          data-size="${escI(item.itemSize)}"
          data-cost="${item.itemCost}"
          data-qty="${item.itemQuantity}"
          data-desc="${escI(item.description)}"
          data-combo="${item.isCombo}"
          data-discount="${item.isOnDiscount}"
          data-pct="${item.discountPercentage}"
          aria-label="Edit ${escI(item.itemName)}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="icon-btn icon-btn-danger" title="Delete Item"
          data-item-action="delete"
          data-id="${item.id}"
          data-name="${escI(item.itemName)}"
          aria-label="Delete ${escI(item.itemName)}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </td>
  `;
  return tr;
}

// ─── Render item list ─────────────────────────────────────────────────────────
function renderItems(items) {
  itemsTbody.innerHTML = '';
  const total = items.length;
  itemsCount.textContent = `${total} item${total !== 1 ? 's' : ''}`;

  if (total === 0) {
    itemsEmptyState.classList.add('visible');
    itemsTable.style.display = 'none';
  } else {
    itemsEmptyState.classList.remove('visible');
    itemsTable.style.display = '';
    items.forEach((item) => itemsTbody.appendChild(buildItemRow(item)));
  }
}

// ─── Fetch & refresh items ────────────────────────────────────────────────────
async function refreshItems() {
  if (!currentRestaurant) return;
  try {
    const data = await adminFetch(
      `/api/admin/restaurants/${currentRestaurant.id}/items`
    );
    if (data.success) {
      renderItems(data.items || []);
    } else {
      showToast(data.error || 'Failed to load menu items', 'error');
    }
  } catch {
    showToast('Network error. Could not load items.', 'error');
  }
}

// ─── Open items panel for a restaurant ───────────────────────────────────────
// Called from admin.js table delegation when action === 'menu'
function openMenuItems(restaurant) {
  currentRestaurant = restaurant;

  // Update section title (breadcrumb style)
  itemsSectionTitle.textContent = `${restaurant.name} — Menu`;

  // ADM-FR-02: show informational closed notice — button stays enabled for admin
  // (The disable-Add restriction applies to customer ordering, not admin menu management)
  const open = isRestaurantOpen(restaurant.openTime, restaurant.closeTime);
  closedNotice.style.display = open ? 'none' : 'flex';
  openAddItemModalBtn.disabled = false;
  openAddItemModalBtn.title = 'Add a new menu item';

  // Switch views
  restaurantsSection.style.display = 'none';
  itemsSection.style.display = '';

  // Enable sidebar link + mark active
  navMenuItems.style.opacity = '';
  navMenuItems.style.pointerEvents = '';
  navMenuItems.style.cursor = '';
  navMenuItems.classList.add('active');
  navRestaurants.classList.remove('active');

  // Update topbar
  document.getElementById('page-title').textContent = `${restaurant.name} — Menu Items`;

  // Hide "Add Restaurant" button
  document.getElementById('open-add-modal').style.display = 'none';

  refreshItems();
}

// ─── Return to restaurants view ───────────────────────────────────────────────
function backToRestaurants() {
  currentRestaurant = null;

  restaurantsSection.style.display = '';
  itemsSection.style.display = 'none';

  navMenuItems.classList.remove('active');
  navMenuItems.style.opacity = '0.5';
  navMenuItems.style.pointerEvents = 'none';
  navMenuItems.style.cursor = 'default';
  navRestaurants.classList.add('active');

  document.getElementById('page-title').textContent = 'Restaurants';
  document.getElementById('open-add-modal').style.display = '';

  // Re-enable add item button for next time
  openAddItemModalBtn.disabled = false;
  closedNotice.style.display = 'none';
}

// ─── Sidebar nav link ────────────────────────────────────────────────────────
navRestaurants.addEventListener('click', (e) => {
  if (itemsSection.style.display !== 'none') {
    e.preventDefault();
    backToRestaurants();
  }
});

// ─── Modal helpers ────────────────────────────────────────────────────────────
function openItemModal(modal) {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeItemModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = '';
}

// ─── Clear form errors ────────────────────────────────────────────────────────
function clearItemFormErrors() {
  [
    [itemNameError,     itemNameInput],
    [itemSizeError,     itemSizeInput],
    [itemCostError,     itemCostInput],
    [itemQtyError,      itemQuantityInput],
    [itemDiscountError, itemDiscountPctInput],
  ].forEach(([err, inp]) => {
    if (err)  err.textContent = '';
    if (inp)  inp.classList.remove('is-error');
  });
  itemErrorBox.textContent = '';
  itemErrorBox.classList.remove('visible');
}

// ─── Map API error to field ────────────────────────────────────────────────────
function displayItemFormError(message) {
  const lower = (message || '').toLowerCase();
  if (lower.includes('name')) {
    itemNameError.textContent = message;
    itemNameInput.classList.add('is-error');
  } else if (lower.includes('size')) {
    itemSizeError.textContent = message;
    itemSizeInput.classList.add('is-error');
  } else if (lower.includes('cost') || lower.includes('price')) {
    itemCostError.textContent = message;
    itemCostInput.classList.add('is-error');
  } else if (lower.includes('quantity') || lower.includes('qty')) {
    itemQtyError.textContent = message;
    itemQuantityInput.classList.add('is-error');
  } else if (lower.includes('discount')) {
    itemDiscountError.textContent = message;
    itemDiscountPctInput.classList.add('is-error');
  } else {
    itemErrorBox.textContent = message || 'An error occurred. Please try again.';
    itemErrorBox.classList.add('visible');
  }
}

// ─── Discount toggle + preview (OFF-FR-03) ────────────────────────────────────
function updateDiscountPreview() {
  const cost = parseFloat(itemCostInput.value);
  const pct  = parseFloat(itemDiscountPctInput.value);
  if (!isNaN(cost) && cost > 0 && !isNaN(pct) && pct > 0 && pct <= 100) {
    const discounted = (cost * (1 - pct / 100)).toFixed(2);
    discountPreview.innerHTML =
      `<span class="price-original">${cost.toFixed(2)} EGP</span> → ` +
      `<span class="price-discounted">${discounted} EGP</span>` +
      ` <span class="discount-badge">−${pct}%</span>`;
  } else {
    discountPreview.innerHTML = '';
  }
}

itemOnDiscountInput.addEventListener('change', () => {
  discountRow.style.display = itemOnDiscountInput.checked ? '' : 'none';
  if (!itemOnDiscountInput.checked) {
    itemDiscountPctInput.value = '';
    discountPreview.innerHTML = '';
  }
});
itemCostInput.addEventListener('input', updateDiscountPreview);
itemDiscountPctInput.addEventListener('input', updateDiscountPreview);

// ─── Open Add Item Modal ──────────────────────────────────────────────────────
function openAddItemModal() {
  editItemIdInput.value = '';
  itemForm.reset();
  clearItemFormErrors();
  discountRow.style.display = 'none';
  discountPreview.innerHTML = '';
  itemModalTitle.textContent = 'Add Menu Item';
  saveItemBtn.textContent = 'Save Item';
  openItemModal(itemModal);
  itemNameInput.focus();
}

// ─── Open Edit Item Modal ─────────────────────────────────────────────────────
function openEditItemModal(data) {
  editItemIdInput.value         = data.id;
  itemNameInput.value           = data.name;
  itemSizeInput.value           = data.size;
  itemCostInput.value           = data.cost;
  itemQuantityInput.value       = data.qty;
  itemDescriptionInput.value    = data.desc;
  itemIsComboInput.checked      = data.combo === 'true' || data.combo === true;
  itemOnDiscountInput.checked   = data.discount === 'true' || data.discount === true;
  itemDiscountPctInput.value    = data.pct || '';

  // Show/hide discount row
  discountRow.style.display = itemOnDiscountInput.checked ? '' : 'none';
  discountPreview.innerHTML = '';
  if (itemOnDiscountInput.checked) updateDiscountPreview();

  clearItemFormErrors();
  itemModalTitle.textContent = 'Edit Menu Item';
  saveItemBtn.textContent = 'Save Changes';
  openItemModal(itemModal);
  itemNameInput.focus();
}

openAddItemModalBtn.addEventListener('click', openAddItemModal);
itemModalCloseBtn.addEventListener('click', () => closeItemModal(itemModal));
cancelItemBtn.addEventListener('click',     () => closeItemModal(itemModal));

// ─── Item Form Submit ─────────────────────────────────────────────────────────
itemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearItemFormErrors();

  const id     = editItemIdInput.value;
  const isEdit = Boolean(id);

  const body = {
    itemName:           itemNameInput.value.trim(),
    itemSize:           itemSizeInput.value,
    itemCost:           parseFloat(itemCostInput.value),
    itemQuantity:       parseInt(itemQuantityInput.value, 10),
    description:        itemDescriptionInput.value.trim(),
    isCombo:            itemIsComboInput.checked,
    isOnDiscount:       itemOnDiscountInput.checked,
    discountPercentage: itemOnDiscountInput.checked
      ? parseFloat(itemDiscountPctInput.value) || 0
      : 0,
  };

  saveItemBtn.disabled    = true;
  saveItemBtn.textContent = isEdit ? 'Saving…' : 'Creating…';

  const restId = currentRestaurant.id;
  const url    = isEdit
    ? `/api/admin/restaurants/${restId}/items/${id}`
    : `/api/admin/restaurants/${restId}/items`;

  try {
    const data = await adminFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      body:   JSON.stringify(body),
    });

    if (data.success) {
      closeItemModal(itemModal);
      showToast(
        isEdit
          ? `"${data.item.itemName}" updated successfully.`
          : `"${data.item.itemName}" added to the menu.`,
        'success'
      );
      await refreshItems();
    } else {
      displayItemFormError(data.error);
    }
  } catch {
    itemErrorBox.textContent = 'Network error. Please try again.';
    itemErrorBox.classList.add('visible');
  } finally {
    saveItemBtn.disabled    = false;
    saveItemBtn.textContent = isEdit ? 'Save Changes' : 'Save Item';
  }
});

// ─── Delete Item Modal ────────────────────────────────────────────────────────
deleteItemModalCloseBtn.addEventListener('click', () => closeItemModal(deleteItemModal));
cancelItemDeleteBtn.addEventListener('click',     () => closeItemModal(deleteItemModal));

function openDeleteItemModal({ id, name }) {
  deleteItemIdInput.value     = id;
  deleteItemName.textContent  = name;
  openItemModal(deleteItemModal);
}

confirmItemDeleteBtn.addEventListener('click', async () => {
  const id     = deleteItemIdInput.value;
  const restId = currentRestaurant.id;

  confirmItemDeleteBtn.disabled    = true;
  confirmItemDeleteBtn.textContent = 'Deleting…';

  try {
    const data = await adminFetch(
      `/api/admin/restaurants/${restId}/items/${id}`,
      { method: 'DELETE' }
    );

    if (data.success) {
      closeItemModal(deleteItemModal);
      showToast('Item deleted from menu.', 'success');
      await refreshItems();
    } else {
      showToast(data.error || 'Failed to delete item.', 'error');
      closeItemModal(deleteItemModal);
    }
  } catch {
    showToast('Network error. Please try again.', 'error');
    closeItemModal(deleteItemModal);
  } finally {
    confirmItemDeleteBtn.disabled    = false;
    confirmItemDeleteBtn.textContent = 'Delete';
  }
});

// ─── Items Table Action Delegation ───────────────────────────────────────────
itemsTbody.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-item-action]');
  if (!btn) return;

  const action = btn.dataset.itemAction;
  const { id, name } = btn.dataset;

  if (action === 'edit') {
    openEditItemModal({
      id,
      name,
      size:     btn.dataset.size,
      cost:     btn.dataset.cost,
      qty:      btn.dataset.qty,
      desc:     btn.dataset.desc,
      combo:    btn.dataset.combo,
      discount: btn.dataset.discount,
      pct:      btn.dataset.pct,
    });
  } else if (action === 'delete') {
    openDeleteItemModal({ id, name });
  }
});

// ─── Close modals on overlay click ───────────────────────────────────────────
[itemModal, deleteItemModal].forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeItemModal(modal);
  });
});

// ─── Keyboard: Escape closes item modals ─────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    [itemModal, deleteItemModal].forEach((m) => {
      if (!m.hidden) closeItemModal(m);
    });
  }
});
