const homeApi = {
  currentSort: 'name',

  async getRestaurants(query = '', sort = 'name') {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (sort) params.set('sort', sort);
    return apiClient.get(`/search?${params.toString()}`);
  },

  getCardHtml(rest) {
    return `
      <div class="rest-card" onclick="if(window.shopApi){shopApi.currentRestaurant={id:${rest.id},restName:'${(rest.restName||rest.name||"").replace(/'/g,"\\'")}',restRate:${rest.restRate||rest.rating||0},restMaxDeliveryTime:${rest.restMaxDeliveryTime||rest.deliveryTime||0},restDeliveryCost:${rest.restDeliveryCost||rest.deliveryPrice||0}};shopApi.loadRestaurant(${rest.id});}go(7)">
        <div class="rest-card-img" style="background-color: var(--c-bg-tertiary); display: flex; align-items: center; justify-content: center; font-size: 2rem;">🍽️</div>
        <div class="rest-card-body">
          <h3>${rest.restName || rest.name}</h3>
          <div class="rest-card-meta">
            <span class="star">★</span> ${rest.restRate || rest.rating || 'New'} 
            <span class="dot"></span> ${rest.restLocation || rest.location || ''}
            <span class="dot"></span> ${rest.restMaxDeliveryTime || rest.deliveryTime || ''} min 
            <span class="dot"></span> ${rest.restDeliveryCost || rest.deliveryPrice || ''} EGP delivery
          </div>
        </div>
      </div>`;
  },

  renderRestaurants(restaurants) {
    const emptyHtml = `<div class="empty-state" style="padding:40px;text-align:center;color:var(--c-text-secondary)">No restaurants found</div>`;
    const html = restaurants.length ? restaurants.map(r => this.getCardHtml(r)).join('') : emptyHtml;

    // Update Home grids (S3 and S18)
    const gridS3 = document.querySelector('#s3 .rest-grid');
    const gridS18 = document.querySelector('#s18 .rest-grid');
    if (gridS3) gridS3.innerHTML = html;
    if (gridS18) gridS18.innerHTML = html;
  },

  renderSearchResults(restaurants) {
    const grid = document.getElementById('search-results');
    if (!grid) return;

    if (!restaurants || restaurants.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="padding:40px;text-align:center;color:var(--c-text-secondary)">No restaurants found</div>`;
      return;
    }

    grid.innerHTML = restaurants.map(r => this.getCardHtml(r)).join('');
  },

  async load() {
    const sort = this.currentSort || 'name';
    const res = await this.getRestaurants('', sort);
    if (res.ok) {
      this.renderRestaurants(res.data.restaurants || []);
    }
  },

  async search() {
    const query = document.getElementById('search-input')?.value || '';
    const sort = this.currentSort || 'name';
    const res = await this.getRestaurants(query, sort);
    if (res.ok) {
      this.renderSearchResults(res.data.restaurants || []);
    }
  },

  setSort(sortValue, label) {
    this.currentSort = sortValue;
    document.querySelectorAll('.sort-btn').forEach(btn => btn.innerHTML = `Sort: ${label} ↕`);
    // Re-run search or load depending on which screen is active
    const s5 = document.getElementById('s5');
    if (s5 && s5.classList.contains('active')) {
      this.search();
    } else {
      this.load();
    }
  },

  // Load offers for S6
  async loadOffers() {
    const grid = document.getElementById('offers-grid');
    if (!grid) return;

    const res = await apiClient.get('/offers/active');
    if (res.ok) {
      const offers = res.data.offers || [];
      if (offers.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="padding:40px;text-align:center;color:var(--c-text-secondary)">No active offers right now</div>`;
        return;
      }
      grid.innerHTML = offers.map(off => `
        <div class="offer-card">
          <div class="offer-card-img" style="background-color: var(--c-bg-tertiary); display: flex; align-items: center; justify-content: center; font-size: 2rem;">🏷️</div>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:15px;font-weight:600;">${off.offerName || 'Special Offer'}</span>
              <span class="tag tag-warn">−${off.discountPercentage}% OFF</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <span style="font-size:13px;color:var(--c-text-muted);text-decoration:line-through;">${off.originalPrice} EGP</span>
              <span style="font-size:17px;font-weight:700;">${off.discountedPrice.toFixed(0)} EGP</span>
            </div>
            <span style="font-size:12px;color:var(--c-text-muted);">Expires: ${off.expiresAt}</span>
          </div>
        </div>
      `).join('');
    }
  }
};

// Make globally accessible
window.homeApi = homeApi;

document.addEventListener('DOMContentLoaded', () => {
  // Setup sorting bindings for all sort menus
  const sortMenus = document.querySelectorAll('.sort-menu');
  sortMenus.forEach(menu => {
    menu.innerHTML = `
      <div class="sort-option active" onclick="homeApi.setSort('name', 'Name'); closeSort('${menu.id}')">Name (A-Z)</div>
      <div class="sort-option" onclick="homeApi.setSort('rating', 'Rating'); closeSort('${menu.id}')">Rating: High → Low</div>
      <div class="sort-option" onclick="homeApi.setSort('delivery_time', 'Delivery Time'); closeSort('${menu.id}')">Delivery Time: Fast</div>
      <div class="sort-option" onclick="homeApi.setSort('delivery_price', 'Delivery Price'); closeSort('${menu.id}')">Delivery Price: Low</div>
    `;
  });

  // Setup search input binding
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => homeApi.search(), 300);
    });
  }

  // Initial load
  homeApi.load();
});
