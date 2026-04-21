/**
 * admin.js – Client-side logic for the Admin Panel (Module 2.1)
 *
 * Implements all Admin flowchart operations:
 *  - addRestaurant()      → POST   /api/admin/restaurants
 *  - updateRestaurant()   → PUT    /api/admin/restaurants/:id
 *  - deleteRestaurant()   → DELETE /api/admin/restaurants/:id
 *  - setOperatingHours()  → PATCH  /api/admin/restaurants/:id/hours
 *
 * Guard: every API call sends X-User-Email header (isAdmin check on server).
 * If the user is not an admin, they are redirected to /login.html.
 */

// ─── Session ──────────────────────────────────────────────────────────────────
// Email is stored in sessionStorage after a successful login.
// login.js stores it when isAdmin === true.
const adminEmail = sessionStorage.getItem('adminEmail');

if (!adminEmail) {
  // Not authenticated as admin → redirect to login
  window.location.href = '/login.html';
}

// ─── DOM References ───────────────────────────────────────────────────────────
const adminEmailLabel      = document.getElementById('admin-email-label');
const statTotal            = document.getElementById('stat-total');
const statOpen             = document.getElementById('stat-open');
const statClosed           = document.getElementById('stat-closed');
const tableCount           = document.getElementById('table-count');
const tbody                = document.getElementById('restaurants-tbody');
const emptyState           = document.getElementById('empty-state');
const toast                = document.getElementById('admin-toast');

// Restaurant modal (Add / Edit)
const restaurantModal      = document.getElementById('restaurant-modal');
const modalTitle           = document.getElementById('modal-title');
const restaurantForm       = document.getElementById('restaurant-form');
const editIdInput          = document.getElementById('edit-restaurant-id');
const restNameInput        = document.getElementById('rest-name');
const restLocationInput    = document.getElementById('rest-location');
const restDelivCostInput   = document.getElementById('rest-delivery-cost');
const restMinTimeInput     = document.getElementById('rest-min-time');
const restMaxTimeInput     = document.getElementById('rest-max-time');
const modalErrorBox        = document.getElementById('modal-error-box');
const saveRestaurantBtn    = document.getElementById('save-restaurant-btn');
const cancelRestaurantBtn  = document.getElementById('cancel-restaurant');
const openAddModalBtn      = document.getElementById('open-add-modal');
const modalCloseBtn        = document.getElementById('modal-close');

// Field error spans (restaurant form)
const restNameError        = document.getElementById('rest-name-error');
const restLocationError    = document.getElementById('rest-location-error');
const restDelivCostError   = document.getElementById('rest-delivery-cost-error');
const restMinTimeError     = document.getElementById('rest-min-time-error');
const restMaxTimeError     = document.getElementById('rest-max-time-error');

// Hours modal
const hoursModal           = document.getElementById('hours-modal');
const hoursForm            = document.getElementById('hours-form');
const hoursRestaurantId    = document.getElementById('hours-restaurant-id');
const hoursRestaurantName  = document.getElementById('hours-restaurant-name');
const openTimeInput        = document.getElementById('open-time');
const closeTimeInput       = document.getElementById('close-time');
const hoursErrorBox        = document.getElementById('hours-error-box');
const saveHoursBtn         = document.getElementById('save-hours-btn');
const cancelHoursBtn       = document.getElementById('cancel-hours');
const hoursModalCloseBtn   = document.getElementById('hours-modal-close');

// Delete modal
const deleteModal          = document.getElementById('delete-modal');
const deleteRestaurantName = document.getElementById('delete-restaurant-name');
const deleteRestaurantId   = document.getElementById('delete-restaurant-id');
const confirmDeleteBtn     = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn      = document.getElementById('cancel-delete');
const deleteModalCloseBtn  = document.getElementById('delete-modal-close');

// ─── Show admin email ─────────────────────────────────────────────────────────
if (adminEmailLabel) adminEmailLabel.textContent = adminEmail;

// ─── Helper: API fetch with admin header ──────────────────────────────────────
async function adminFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Email': adminEmail,          // isAdmin guard on server
    ...(options.headers || {}),
  };
  const response = await fetch(url, { ...options, headers });
  return response.json();
}

// ─── Helper: Toast notifications ─────────────────────────────────────────────
let toastTimer = null;
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `admin-toast ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.className = 'admin-toast';
  }, 3500);
}

// ─── Helper: Field error helpers ─────────────────────────────────────────────
function setFieldError(el, input, message) {
  el.textContent = message;
  input.classList.add('is-error');
}
function clearFieldError(el, input) {
  el.textContent = '';
  input.classList.remove('is-error');
}
function clearAllFormErrors() {
  [
    [restNameError, restNameInput],
    [restLocationError, restLocationInput],
    [restDelivCostError, restDelivCostInput],
    [restMinTimeError, restMinTimeInput],
    [restMaxTimeError, restMaxTimeInput],
  ].forEach(([err, inp]) => clearFieldError(err, inp));
  modalErrorBox.textContent = '';
  modalErrorBox.classList.remove('visible');
}

// ─── Helper: Map API error message to field ───────────────────────────────────
function displayFormError(message) {
  const lower = (message || '').toLowerCase();
  if (lower.includes('name')) {
    setFieldError(restNameError, restNameInput, message);
  } else if (lower.includes('location')) {
    setFieldError(restLocationError, restLocationInput, message);
  } else if (lower.includes('delivery cost')) {
    setFieldError(restDelivCostError, restDelivCostInput, message);
  } else if (lower.includes('minimum')) {
    setFieldError(restMinTimeError, restMinTimeInput, message);
  } else if (lower.includes('maximum')) {
    setFieldError(restMaxTimeError, restMaxTimeInput, message);
  } else {
    modalErrorBox.textContent = message || 'An error occurred. Please try again.';
    modalErrorBox.classList.add('visible');
  }
}

// ─── Build table row ──────────────────────────────────────────────────────────
function buildRow(r) {
  const isOpen = r.openTime && r.closeTime
    ? (() => {
        const now = new Date();
        const nowMins = now.getHours() * 60 + now.getMinutes();
        const [oh, om] = r.openTime.split(':').map(Number);
        const [ch, cm] = r.closeTime.split(':').map(Number);
        return nowMins >= oh * 60 + om && nowMins < ch * 60 + cm;
      })()
    : false;

  const hoursDisplay = r.openTime && r.closeTime
    ? `${r.openTime} – ${r.closeTime}`
    : '—';

  const tr = document.createElement('tr');
  tr.dataset.id = r.id;
  tr.innerHTML = `
    <td><strong>${escHtml(r.restName)}</strong></td>
    <td>${escHtml(r.restLocation)}</td>
    <td>${r.restDeliveryCost} EGP</td>
    <td>${r.restMinDeliveryTime}–${r.restMaxDeliveryTime} min</td>
    <td>${hoursDisplay}</td>
    <td>
      <span class="status-badge ${isOpen ? 'open' : 'closed'}">
        <span class="status-dot"></span>
        ${isOpen ? 'Open' : 'Closed'}
      </span>
    </td>
    <td class="actions-col">
      <div class="table-actions">
        <button class="icon-btn icon-btn-menu" title="Manage Menu Items"
          data-action="menu" data-id="${r.id}" data-name="${escHtml(r.restName)}"
          data-open="${r.openTime || ''}" data-close="${r.closeTime || ''}"
          aria-label="Manage menu for ${escHtml(r.restName)}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1" ry="1"/>
            <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
          </svg>
        </button>
        <button class="icon-btn icon-btn-hours" title="Set Operating Hours"
          data-action="hours" data-id="${r.id}" data-name="${escHtml(r.restName)}"
          data-open="${r.openTime || ''}" data-close="${r.closeTime || ''}"
          aria-label="Set hours for ${escHtml(r.restName)}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </button>
        <button class="icon-btn" title="Edit Restaurant"
          data-action="edit"
          data-id="${r.id}"
          data-name="${escHtml(r.restName)}"
          data-location="${escHtml(r.restLocation)}"
          data-cost="${r.restDeliveryCost}"
          data-mintime="${r.restMinDeliveryTime}"
          data-maxtime="${r.restMaxDeliveryTime}"
          aria-label="Edit ${escHtml(r.restName)}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="icon-btn icon-btn-danger" title="Delete Restaurant"
          data-action="delete" data-id="${r.id}" data-name="${escHtml(r.restName)}"
          aria-label="Delete ${escHtml(r.restName)}">
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

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = String(str || '');
  return d.innerHTML;
}

// ─── Render restaurant list ───────────────────────────────────────────────────
function renderRestaurants(restaurants) {
  tbody.innerHTML = '';

  const total  = restaurants.length;
  let openCount = 0;

  restaurants.forEach((r) => {
    // Compute open status client-side for stats
    if (r.openTime && r.closeTime) {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const [oh, om] = r.openTime.split(':').map(Number);
      const [ch, cm] = r.closeTime.split(':').map(Number);
      if (nowMins >= oh * 60 + om && nowMins < ch * 60 + cm) openCount++;
    }
    tbody.appendChild(buildRow(r));
  });

  // Update stats
  statTotal.textContent  = total;
  statOpen.textContent   = openCount;
  statClosed.textContent = total - openCount;
  tableCount.textContent = `${total} restaurant${total !== 1 ? 's' : ''}`;

  // Toggle empty state
  if (total === 0) {
    emptyState.classList.add('visible');
    document.getElementById('restaurants-table').style.display = 'none';
  } else {
    emptyState.classList.remove('visible');
    document.getElementById('restaurants-table').style.display = '';
  }
}

// ─── Fetch & refresh list ─────────────────────────────────────────────────────
async function refreshRestaurants() {
  try {
    const data = await adminFetch('/api/admin/restaurants');
    if (data.success) {
      renderRestaurants(data.restaurants || []);
    } else {
      showToast(data.error || 'Failed to load restaurants', 'error');
    }
  } catch {
    showToast('Network error. Could not load restaurants.', 'error');
  }
}

// ─── Modal helpers ─────────────────────────────────────────────────────────────
function openModal(modal) {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = '';
}

// ─── Add Restaurant Modal ─────────────────────────────────────────────────────
function openAddModal() {
  editIdInput.value = '';
  restaurantForm.reset();
  clearAllFormErrors();
  modalTitle.textContent = 'Add Restaurant';
  saveRestaurantBtn.textContent = 'Save Restaurant';
  openModal(restaurantModal);
  restNameInput.focus();
}

function openEditModal(data) {
  editIdInput.value            = data.id;
  restNameInput.value          = data.name;
  restLocationInput.value      = data.location;
  restDelivCostInput.value     = data.cost;
  restMinTimeInput.value       = data.minTime;
  restMaxTimeInput.value       = data.maxTime;
  clearAllFormErrors();
  modalTitle.textContent       = 'Edit Restaurant';
  saveRestaurantBtn.textContent = 'Save Changes';
  openModal(restaurantModal);
  restNameInput.focus();
}

openAddModalBtn.addEventListener('click', openAddModal);
modalCloseBtn.addEventListener('click', () => closeModal(restaurantModal));
cancelRestaurantBtn.addEventListener('click', () => closeModal(restaurantModal));

// ─── Restaurant Form Submit ────────────────────────────────────────────────────
// Covers both addRestaurant() and updateRestaurant() flowcharts
restaurantForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAllFormErrors();

  const id           = editIdInput.value;
  const isEdit       = Boolean(id);
  const body = {
    restName:            restNameInput.value.trim(),
    restLocation:        restLocationInput.value.trim(),
    restDeliveryCost:    parseFloat(restDelivCostInput.value),
    restMinDeliveryTime: parseInt(restMinTimeInput.value, 10),
    restMaxDeliveryTime: parseInt(restMaxTimeInput.value, 10),
  };

  saveRestaurantBtn.disabled    = true;
  saveRestaurantBtn.textContent = isEdit ? 'Saving…' : 'Creating…';

  try {
    const data = await adminFetch(
      isEdit ? `/api/admin/restaurants/${id}` : '/api/admin/restaurants',
      { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(body) }
    );

    if (data.success) {
      closeModal(restaurantModal);
      showToast(
        isEdit
          ? `"${data.restaurant.restName}" updated successfully.`
          : `"${data.restaurant.restName}" added to your list.`,
        'success'
      );
      await refreshRestaurants();
    } else {
      // Flowchart: "Fields Valid? No" → show error and stay on form
      displayFormError(data.error);
    }
  } catch {
    modalErrorBox.textContent = 'Network error. Please try again.';
    modalErrorBox.classList.add('visible');
  } finally {
    saveRestaurantBtn.disabled    = false;
    saveRestaurantBtn.textContent = isEdit ? 'Save Changes' : 'Save Restaurant';
  }
});

// ─── Set Operating Hours Modal ────────────────────────────────────────────────
// Flowchart setOperatingHours(): select restaurant → enter times → Close > Open? → save
hoursModalCloseBtn.addEventListener('click', () => closeModal(hoursModal));
cancelHoursBtn.addEventListener('click',     () => closeModal(hoursModal));

function openHoursModal({ id, name, openTime, closeTime }) {
  hoursRestaurantId.value        = id;
  hoursRestaurantName.textContent = `Setting hours for: ${name}`;
  openTimeInput.value            = openTime  || '';
  closeTimeInput.value           = closeTime || '';
  hoursErrorBox.textContent      = '';
  hoursErrorBox.classList.remove('visible');
  openModal(hoursModal);
  openTimeInput.focus();
}

hoursForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hoursErrorBox.textContent = '';
  hoursErrorBox.classList.remove('visible');

  const id        = hoursRestaurantId.value;
  const openTime  = openTimeInput.value;
  const closeTime = closeTimeInput.value;

  if (!openTime || !closeTime) {
    hoursErrorBox.textContent = 'Both open and close times are required.';
    hoursErrorBox.classList.add('visible');
    return;
  }

  saveHoursBtn.disabled    = true;
  saveHoursBtn.textContent = 'Saving…';

  try {
    const data = await adminFetch(`/api/admin/restaurants/${id}/hours`, {
      method: 'PATCH',
      body: JSON.stringify({ openTime, closeTime }),
    });

    if (data.success) {
      closeModal(hoursModal);
      showToast('Operating hours saved.', 'success');
      await refreshRestaurants();
    } else {
      // Flowchart: "Close > Open? No" → show error
      hoursErrorBox.textContent = data.error;
      hoursErrorBox.classList.add('visible');
    }
  } catch {
    hoursErrorBox.textContent = 'Network error. Please try again.';
    hoursErrorBox.classList.add('visible');
  } finally {
    saveHoursBtn.disabled    = false;
    saveHoursBtn.textContent = 'Save Hours';
  }
});

// ─── Delete Restaurant Modal ──────────────────────────────────────────────────
// Flowchart deleteRestaurant(): "Confirm?" decision node
deleteModalCloseBtn.addEventListener('click', () => closeModal(deleteModal));
cancelDeleteBtn.addEventListener('click',     () => closeModal(deleteModal));

function openDeleteModal({ id, name }) {
  deleteRestaurantId.value           = id;
  deleteRestaurantName.textContent   = name;
  openModal(deleteModal);
}

confirmDeleteBtn.addEventListener('click', async () => {
  const id = deleteRestaurantId.value;

  confirmDeleteBtn.disabled    = true;
  confirmDeleteBtn.textContent = 'Deleting…';

  try {
    const data = await adminFetch(`/api/admin/restaurants/${id}`, { method: 'DELETE' });

    if (data.success) {
      closeModal(deleteModal);
      showToast('Restaurant deleted successfully.', 'success');
      await refreshRestaurants();
    } else {
      showToast(data.error || 'Failed to delete restaurant.', 'error');
      closeModal(deleteModal);
    }
  } catch {
    showToast('Network error. Please try again.', 'error');
    closeModal(deleteModal);
  } finally {
    confirmDeleteBtn.disabled    = false;
    confirmDeleteBtn.textContent = 'Delete';
  }
});

// ─── Table Action Delegation ──────────────────────────────────────────────────
tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const { id, name } = btn.dataset;

  if (action === 'menu') {
    // Delegate to admin-items.js which initializes the items panel
    if (typeof openMenuItems === 'function') {
      openMenuItems({ id, name, openTime: btn.dataset.open, closeTime: btn.dataset.close });
    }
  } else if (action === 'edit') {
    openEditModal({
      id,
      name,
      location: btn.dataset.location,
      cost:     btn.dataset.cost,
      minTime:  btn.dataset.mintime,
      maxTime:  btn.dataset.maxtime,
    });
  } else if (action === 'hours') {
    openHoursModal({
      id,
      name,
      openTime:  btn.dataset.open,
      closeTime: btn.dataset.close,
    });
  } else if (action === 'delete') {
    openDeleteModal({ id, name });
  }
});

// ─── Close modals on overlay click ───────────────────────────────────────────
[restaurantModal, hoursModal, deleteModal].forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

// ─── Keyboard: Escape closes modals ──────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    [restaurantModal, hoursModal, deleteModal].forEach((m) => {
      if (!m.hidden) closeModal(m);
    });
  }
});

// ─── Initial Load ─────────────────────────────────────────────────────────────
refreshRestaurants();
