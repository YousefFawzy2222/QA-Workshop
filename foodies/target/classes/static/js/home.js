/**
 * home.js – Restaurant browsing for regular users
 *
 * API: GET /api/search?q=term&sort=name|rating|delivery_time|delivery_price
 */

// ─── Auth Guard ──────────────────────────────────────────────────────────────
const userEmail = sessionStorage.getItem('userEmail');
if (!userEmail) {
  window.location.href = '/login.html';
}

// ─── DOM References ──────────────────────────────────────────────────────────
const searchInput     = document.getElementById('search-input');
const sortSelect      = document.getElementById('sort-select');
const restaurantsGrid = document.getElementById('restaurants-grid');
const resultsCount    = document.getElementById('results-count');
const emptyState      = document.getElementById('empty-state');
const loadingState    = document.getElementById('loading-state');
const userEmailDisplay= document.getElementById('user-email-display');
const userAvatar      = document.getElementById('user-avatar');
const logoutBtn       = document.getElementById('logout-btn');

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

function isRestaurantOpen(openTime, closeTime) {
  if (!openTime || !closeTime) return false;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  return nowMins >= oh * 60 + om && nowMins < ch * 60 + cm;
}

function renderStars(rating) {
  const rounded = Math.round(rating);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star${i <= rounded ? '' : ' empty'}">★</span>`;
  }
  return html;
}

// ─── Build Restaurant Card ───────────────────────────────────────────────────
function buildCard(r) {
  const open = isRestaurantOpen(r.openTime, r.closeTime);
  const statusClass = open ? 'open' : 'closed';
  const statusText  = open ? 'Open' : 'Closed';

  const hoursDisplay = (r.openTime && r.closeTime)
    ? `${r.openTime} – ${r.closeTime}`
    : 'Hours not set';

  const div = document.createElement('div');
  div.className = 'restaurant-card';
  div.innerHTML = `
    <div class="card-top">
      <div>
        <div class="restaurant-name">${escHtml(r.name)}</div>
        ${r.location ? `<div class="restaurant-location">📍 ${escHtml(r.location)}</div>` : ''}
      </div>
      <span class="status-badge ${statusClass}">
        <span class="status-dot"></span>
        ${statusText}
      </span>
    </div>

    <div class="card-details">
      <div class="detail-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="detail-value">${r.deliveryTime} min</span>
      </div>
      <div class="detail-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
        <span class="detail-value">${r.deliveryPrice} EGP</span>
      </div>
      <div class="detail-item">
        <div class="rating-stars">
          ${renderStars(r.rating)}
          <span class="rating-number">${(r.rating || 0).toFixed(1)}</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      ${hoursDisplay}
    </div>
  `;
  return div;
}

// ─── Render ──────────────────────────────────────────────────────────────────
function renderRestaurants(restaurants) {
  restaurantsGrid.innerHTML = '';
  loadingState.style.display = 'none';

  const count = restaurants.length;
  resultsCount.textContent = `${count} restaurant${count !== 1 ? 's' : ''}`;

  if (count === 0) {
    emptyState.style.display = '';
    restaurantsGrid.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    restaurantsGrid.style.display = '';
    restaurants.forEach((r) => restaurantsGrid.appendChild(buildCard(r)));
  }
}

// ─── Fetch Restaurants ───────────────────────────────────────────────────────
async function fetchRestaurants() {
  const query = searchInput.value.trim();
  const sort  = sortSelect.value;

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&sort=${sort}`, {
      headers: { 'X-User-Email': userEmail },
    });
    const data = await res.json();
    if (data.success) {
      renderRestaurants(data.restaurants || []);
    } else {
      renderRestaurants([]);
    }
  } catch {
    loadingState.style.display = 'none';
    emptyState.style.display = '';
    restaurantsGrid.style.display = 'none';
    resultsCount.textContent = '0 restaurants';
  }
}

// ─── Event Listeners ─────────────────────────────────────────────────────────
let searchTimeout = null;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchRestaurants, 300);
});

sortSelect.addEventListener('change', fetchRestaurants);

logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('adminEmail');
  window.location.href = '/login.html';
});

// ─── Init ────────────────────────────────────────────────────────────────────
fetchRestaurants();
