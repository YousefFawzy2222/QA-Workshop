/**
 * saved-addresses.js – Address management for regular users
 *
 * API:
 *  GET    /api/addresses/
 *  POST   /api/addresses/
 *  PUT    /api/addresses/:id
 *  DELETE /api/addresses/:id
 *  PUT    /api/addresses/:id/primary
 */

// ─── Auth Guard ──────────────────────────────────────────────────────────────
const userEmail = sessionStorage.getItem('userEmail');
if (!userEmail) {
  window.location.href = '/login.html';
}

// ─── DOM References ──────────────────────────────────────────────────────────
const addressesContainer = document.getElementById('addresses-container');
const addAddressBtn      = document.getElementById('add-address-btn');
const addressModal       = document.getElementById('address-modal');
const closeModalBtn      = document.getElementById('close-modal');
const cancelModalBtn     = document.getElementById('cancel-modal');
const addressForm        = document.getElementById('address-form');
const modalTitle         = document.getElementById('modal-title');
const formError          = document.getElementById('form-error');
const saveAddressBtn     = document.getElementById('save-address-btn');
const userEmailDisplay   = document.getElementById('user-email-display');
const userAvatar         = document.getElementById('user-avatar');
const logoutBtn          = document.getElementById('logout-btn');

// Set user info in sidebar
if (userEmail) {
  userEmailDisplay.textContent = userEmail;
  userAvatar.textContent = userEmail.charAt(0).toUpperCase();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = String(str || '');
  return d.innerHTML;
}

// ─── Modal Helpers ───────────────────────────────────────────────────────────
function openModal() {
  addressModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  addressModal.hidden = true;
  document.body.style.overflow = '';
}

// ─── API Helper ──────────────────────────────────────────────────────────────
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': userEmail,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`/api/addresses${endpoint}`, options);
  const data = await res.json();
  if (!data.success && data.error === 'Authentication required') {
    window.location.href = '/login.html';
  }
  return data;
}

// ─── Render Addresses ────────────────────────────────────────────────────────
async function loadAddresses() {
  const data = await apiCall('/');
  if (data.success) {
    addressesContainer.innerHTML = '';
    if (data.addresses.length === 0) {
      addressesContainer.innerHTML = `
        <div class="addr-empty-state">
          <div class="empty-icon" aria-hidden="true">📍</div>
          <p class="empty-title">No saved addresses yet</p>
          <p class="empty-sub">Click "Add Address" to create your first delivery address.</p>
        </div>
      `;
      return;
    }

    data.addresses.forEach((addr) => {
      const card = document.createElement('div');
      card.className = 'address-card';
      card.innerHTML = `
        <div class="address-header">
          <h3>${escHtml(addr.street)}, Bldg ${escHtml(addr.building)}</h3>
        </div>
        <div class="address-body">
          <p><strong>Phone:</strong> ${escHtml(addr.phone)}</p>
          <p><strong>Apt / Floor:</strong> ${addr.apartment ? escHtml(addr.apartment) : 'N/A'} / ${addr.floor ? escHtml(addr.floor) : 'N/A'}</p>
          <p><strong>Landmark:</strong> ${addr.landmark ? escHtml(addr.landmark) : 'N/A'}</p>
        </div>
        <div class="address-actions">
          <button class="btn-card btn-card-edit edit-btn" data-id="${addr.id}">
            Edit
          </button>
          <button class="btn-card btn-card-danger delete-btn" data-id="${addr.id}">
            Delete
          </button>
        </div>
      `;
      addressesContainer.appendChild(card);
    });

    attachActionListeners();
  }
}

// ─── Action Listeners ────────────────────────────────────────────────────────
function attachActionListeners() {
  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.closest('[data-id]').dataset.id;
      const data = await apiCall('/');
      const addr = data.addresses.find((a) => String(a.id) === String(id));
      if (addr) openEditModal(addr);
    });
  });

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.closest('[data-id]').dataset.id;
      if (confirm('Are you sure you want to delete this address?')) {
        await apiCall(`/${id}`, 'DELETE');
        loadAddresses();
      }
    });
  });
}

// ─── Open Add Modal ──────────────────────────────────────────────────────────
function openAddModal() {
  addressForm.reset();
  document.getElementById('address-id').value = '';
  modalTitle.textContent = 'Add New Address';
  saveAddressBtn.textContent = 'Save Address';
  clearFormError();
  openModal();
}

// ─── Open Edit Modal ─────────────────────────────────────────────────────────
function openEditModal(addr) {
  document.getElementById('address-id').value = addr.id;
  document.getElementById('phone').value      = addr.phone || '';
  document.getElementById('building').value   = addr.building || '';
  document.getElementById('apartment').value  = addr.apartment || '';
  document.getElementById('floor').value      = addr.floor || '';
  document.getElementById('street').value     = addr.street || '';
  document.getElementById('landmark').value   = addr.landmark || '';
  modalTitle.textContent = 'Edit Address';
  saveAddressBtn.textContent = 'Save Changes';
  clearFormError();
  openModal();
}

// ─── Error Handling ──────────────────────────────────────────────────────────
function showFormError(message) {
  formError.textContent = message;
  formError.classList.add('visible');
}

function clearFormError() {
  formError.textContent = '';
  formError.classList.remove('visible');
}

// ─── Event Listeners ─────────────────────────────────────────────────────────
addAddressBtn.addEventListener('click', openAddModal);
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

// Close on overlay click
addressModal.addEventListener('click', (e) => {
  if (e.target === addressModal) closeModal();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !addressModal.hidden) closeModal();
});

// Form submission
addressForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormError();

  const id = document.getElementById('address-id').value;
  const payload = {
    phone:     document.getElementById('phone').value,
    building:  document.getElementById('building').value,
    apartment: document.getElementById('apartment').value,
    floor:     document.getElementById('floor').value,
    street:    document.getElementById('street').value,
    landmark:  document.getElementById('landmark').value,
  };

  const endpoint = id ? `/${id}` : '/';
  const method   = id ? 'PUT' : 'POST';

  saveAddressBtn.disabled    = true;
  saveAddressBtn.textContent = 'Saving…';

  try {
    const data = await apiCall(endpoint, method, payload);
    if (data.success) {
      closeModal();
      loadAddresses();
    } else {
      showFormError(data.error || 'An error occurred.');
    }
  } catch {
    showFormError('Network error. Please try again.');
  } finally {
    saveAddressBtn.disabled    = false;
    saveAddressBtn.textContent = id ? 'Save Changes' : 'Save Address';
  }
});

// Logout
logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('adminEmail');
  window.location.href = '/login.html';
});

// ─── Init ────────────────────────────────────────────────────────────────────
loadAddresses();
