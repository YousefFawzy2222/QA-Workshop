const homeApi = {
  currentSort: 'distance',

  async getRestaurants(query = '', sort = 'name') {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (sort) params.set('sort', sort);
    return apiClient.get(`/search?${params.toString()}`);
  },

  _getDistance(rest) {
    // Stable mock distance based on ID for testing (1-15 km range)
    if (rest.distance !== undefined) return rest.distance;
    return ((rest.id * 7) % 150) / 10 + 0.5; // e.g. 1.2, 5.4, 10.1
  },

  _isRestaurantOpen(rest) {
    if (!rest.openTime || !rest.closeTime) return true;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = rest.openTime.split(':').map(Number);
    const [closeH, closeM] = rest.closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    if (closeMinutes <= openMinutes) {
      return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  },

  getCardHtml(rest) {
    const dist = this._getDistance(rest);
    const isOutOfRange = dist > 10;
    const isOpen = this._isRestaurantOpen(rest);
    
    return `
      <div class="rest-card ${isOutOfRange ? 'out-of-range' : ''}" 
           style="${isOutOfRange ? 'opacity: 0.6; pointer-events: none;' : ''}"
           onclick="${isOutOfRange ? '' : `if(window.shopApi){shopApi.currentRestaurant={id:${rest.id},restName:'${(rest.restName||rest.name||"").replace(/'/g,"\\'")}',restRate:${rest.restRate||rest.rating||0},restMaxDeliveryTime:${rest.restMaxDeliveryTime||rest.deliveryTime||0},restDeliveryCost:${rest.restDeliveryCost||rest.deliveryPrice||0}};shopApi.loadRestaurant(${rest.id});}go(7)`}">
        <div class="rest-card-img" style="background-color: var(--c-bg-tertiary); display: flex; align-items: center; justify-content: center; font-size: 2rem;">🍽️</div>
        <div class="rest-card-body">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <h3>${rest.restName || rest.name}</h3>
            <div>
              ${isOutOfRange ? '<span class="tag tag-error" style="font-size:10px;">Out of Range</span>' : ''}
              ${!isOpen ? '<span class="tag tag-error" style="font-size:10px;">Closed</span>' : ''}
            </div>
          </div>
          <div class="rest-card-meta">
            <span class="star">★</span> ${rest.restRate || rest.rating || 'New'} 
            <span class="dot"></span> ${dist.toFixed(1)} km
            <span class="dot"></span> ${rest.restMaxDeliveryTime || rest.deliveryTime || ''} min 
            <span class="dot"></span> ${rest.restDeliveryCost || rest.deliveryPrice || ''} EGP
          </div>
          ${isOutOfRange ? '<div style="color:var(--c-error);font-size:11px;margin-top:5px;">This restaurant is out of range</div>' : ''}
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
    const sort = this.currentSort || 'distance';
    const res = await this.getRestaurants('', sort);
    if (res.ok) {
      let restaurants = (res.data.restaurants || []).map(r => ({...r, distance: this._getDistance(r)}));
      if (sort === 'distance') restaurants.sort((a,b) => a.distance - b.distance);
      this.renderRestaurants(restaurants);
    }
  },

  async search() {
    const query = document.getElementById('search-input')?.value || '';
    const sort = this.currentSort || 'distance';
    const res = await this.getRestaurants(query, sort);
    if (res.ok) {
      let restaurants = res.data.restaurants || [];
      // Fuzzy search fallback
      if (restaurants.length === 0 && query.trim().length > 0) {
        const allRes = await this.getRestaurants('', sort);
        if (allRes.ok) {
          const allRests = allRes.data.restaurants || [];
          restaurants = allRests.filter(r => this._fuzzyMatch((r.restName || r.name || '').toLowerCase(), query.toLowerCase()));
        }
      }
      
      // Client-side sorting and distance assignment to ensure stability for testing
      restaurants = restaurants.map(r => ({...r, distance: this._getDistance(r)}));
      
      if (sort === 'distance') restaurants.sort((a,b) => a.distance - b.distance);
      else if (sort === 'distance_desc') restaurants.sort((a,b) => b.distance - a.distance);
      else if (sort === 'rating') restaurants.sort((a,b) => (b.restRate||b.rating||0) - (a.restRate||a.rating||0));
      else if (sort === 'rating_asc') restaurants.sort((a,b) => (a.restRate||a.rating||0) - (b.restRate||b.rating||0));
      
      this.renderSearchResults(restaurants);
    }
  },

  // Levenshtein distance for fuzzy matching
  _levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({length: m+1}, () => Array(n+1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[m][n];
  },

  _fuzzyMatch(name, query) {
    // Check each word of the name against the query
    const words = name.split(/\s+/);
    // Increased threshold slightly (50% of query length) for better typo tolerance
    const threshold = Math.max(1, Math.floor(query.length * 0.5));
    return words.some(word => this._levenshtein(word, query) <= threshold);
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
      <div class="sort-option active" onclick="homeApi.setSort('distance', 'Nearest'); closeSort('${menu.id}')">Distance: Nearest</div>
      <div class="sort-option" onclick="homeApi.setSort('distance_desc', 'Farthest'); closeSort('${menu.id}')">Distance: Farthest</div>
      <div class="sort-option" onclick="homeApi.setSort('name', 'Name'); closeSort('${menu.id}')">Name (A-Z)</div>
      <div class="sort-option" onclick="homeApi.setSort('rating', 'Rating ↓'); closeSort('${menu.id}')">Rating: High → Low</div>
      <div class="sort-option" onclick="homeApi.setSort('rating_asc', 'Rating ↑'); closeSort('${menu.id}')">Rating: Low → High</div>
      <div class="sort-option" onclick="homeApi.setSort('delivery_time', 'Delivery Time'); closeSort('${menu.id}')">Delivery Time: Fast</div>
      <div class="sort-option" onclick="homeApi.setSort('delivery_price', 'Delivery Price'); closeSort('${menu.id}')">Delivery Price: Low</div>
    `;
  });

  // Setup search input binding
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => homeApi.search(), 300);
      if (clearBtn) clearBtn.style.display = searchInput.value.length > 0 ? 'inline' : 'none';
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { clearTimeout(debounceTimer); homeApi.search(); }
    });
  }

  // Initial load
  homeApi.load();
});
