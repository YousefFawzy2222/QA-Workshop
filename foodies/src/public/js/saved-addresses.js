const userEmail = sessionStorage.getItem('userEmail');
if (!userEmail) {
  window.location.href = '/login.html';
}

// DOM Elements
const addressesContainer = document.getElementById('addresses-container');
const addAddressBtn = document.getElementById('add-address-btn');
const addressModal = document.getElementById('address-modal');
const closeModal = document.getElementById('close-modal');
const addressForm = document.getElementById('address-form');
const modalTitle = document.getElementById('modal-title');
const formError = document.getElementById('form-error');

// API Helper
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': userEmail
    }
  };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`/api/addresses${endpoint}`, options);
  const data = await res.json();
  if (!data.success && data.error === 'Authentication required') {
    window.location.href = '/login.html';
  }
  return data;
}

// Render addresses
async function loadAddresses() {
  const data = await apiCall('/');
  if (data.success) {
    addressesContainer.innerHTML = '';
    if (data.addresses.length === 0) {
      addressesContainer.innerHTML = '<div class="empty-state">No saved addresses yet.</div>';
      return;
    }

    data.addresses.forEach(addr => {
      const card = document.createElement('div');
      card.className = `address-card glass-panel ${addr.isPrimary ? 'primary-card' : ''}`;
      card.innerHTML = `
        <div class="address-header">
          <h3>${addr.street}, Bldg ${addr.building}</h3>
          ${addr.isPrimary ? '<span class="badge">Primary</span>' : ''}
        </div>
        <div class="address-body">
          <p><strong>Phone:</strong> ${addr.phone}</p>
          <p><strong>Apt/Floor:</strong> ${addr.apartment ? addr.apartment : 'N/A'} / ${addr.floor ? addr.floor : 'N/A'}</p>
          <p><strong>Landmark:</strong> ${addr.landmark || 'N/A'}</p>
        </div>
        <div class="address-actions">
          <button class="btn btn-sm edit-btn" data-id="${addr.id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${addr.id}">Delete</button>
          ${!addr.isPrimary ? `<button class="btn btn-sm btn-outline set-primary-btn" data-id="${addr.id}">Set Primary</button>` : ''}
        </div>
      `;
      addressesContainer.appendChild(card);
    });

    attachActionListeners();
  }
}

function attachActionListeners() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const data = await apiCall('/');
      const addr = data.addresses.find(a => a.id === id);
      if (addr) openModal(addr);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (confirm('Are you sure you want to delete this address?')) {
        await apiCall(`/${e.target.dataset.id}`, 'DELETE');
        loadAddresses();
      }
    });
  });

  document.querySelectorAll('.set-primary-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      await apiCall(`/${e.target.dataset.id}/primary`, 'PUT');
      loadAddresses();
    });
  });
}

// Modal Logic
function openModal(addr = null) {
  formError.classList.add('hidden');
  addressModal.classList.remove('hidden');
  if (addr) {
    modalTitle.textContent = 'Edit Address';
    document.getElementById('address-id').value = addr.id;
    document.getElementById('phone').value = addr.phone;
    document.getElementById('building').value = addr.building;
    document.getElementById('apartment').value = addr.apartment;
    document.getElementById('floor').value = addr.floor;
    document.getElementById('street').value = addr.street;
    document.getElementById('landmark').value = addr.landmark;
    document.getElementById('isPrimary').checked = addr.isPrimary;
  } else {
    modalTitle.textContent = 'Add New Address';
    addressForm.reset();
    document.getElementById('address-id').value = '';
  }
}

addAddressBtn.addEventListener('click', () => openModal());
closeModal.addEventListener('click', () => addressModal.classList.add('hidden'));

addressForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('address-id').value;
  const payload = {
    phone: document.getElementById('phone').value,
    building: document.getElementById('building').value,
    apartment: document.getElementById('apartment').value,
    floor: document.getElementById('floor').value,
    street: document.getElementById('street').value,
    landmark: document.getElementById('landmark').value,
    isPrimary: document.getElementById('isPrimary').checked,
  };

  const endpoint = id ? `/${id}` : '/';
  const method = id ? 'PUT' : 'POST';

  const data = await apiCall(endpoint, method, payload);
  if (data.success) {
    addressModal.classList.add('hidden');
    loadAddresses();
  } else {
    formError.textContent = data.error;
    formError.classList.remove('hidden');
  }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', (e) => {
  e.preventDefault();
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('adminEmail');
  window.location.href = '/login.html';
});

// Init
loadAddresses();
