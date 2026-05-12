const homeApi = {
  async getRestaurants(query = '', sort = 'name') {
    // Use the search endpoint with query and sort parameters
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (sort) params.set('sort', sort);
    return apiClient.get(`/search?${params.toString()}`);
  },

  renderRestaurants(restaurants) {
    const emptyHtml = `<div class="empty-state" style="padding:40px;text-align:center;color:var(--c-text-secondary)">No restaurants found</div>`;
    const getHtml = (rest) => `
      <div class="rest-card" onclick="go(7)">
        <div class="rest-card-img" style="background-color: var(--c-bg-tertiary); display: flex; align-items: center; justify-content: center; font-size: 2rem;">🍽️</div>
        <div class="rest-card-body">
          <h3>${rest.restName || rest.name}</h3>
          <div class="rest-card-meta">
            <span class="star">★</span> ${rest.restRate || rest.rating || 'New'} 
            <span class="dot"></span> ${rest.restLocation || rest.location}
            <span class="dot"></span> ${rest.restMaxDeliveryTime || rest.deliveryTime} min 
            <span class="dot"></span> ${rest.restDeliveryCost || rest.deliveryPrice} EGP delivery
          </div>
        </div>
      </div>`;
    
    const html = restaurants.length ? restaurants.map(getHtml).join('') : emptyHtml;
    
    // Update both S3 and S18 grids
    const gridS3 = document.querySelector('#s3 .rest-grid');
    const gridS18 = document.querySelector('#s18 .rest-grid');
    if (gridS3) gridS3.innerHTML = html;
    if (gridS18) gridS18.innerHTML = html;
  },

  async load() {
    // Current search/sort state
    const query = document.getElementById('search-input')?.value || '';
    const sort = this.currentSort || 'name';

    const res = await this.getRestaurants(query, sort);
    if (res.ok) {
      this.renderRestaurants(res.data.restaurants || []);
    }
  },

  setSort(sortValue, label) {
    this.currentSort = sortValue;
    // Update labels
    document.querySelectorAll('.sort-btn').forEach(btn => btn.innerHTML = `Sort: ${label} ↕`);
    this.load();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Setup sorting bindings
  const sortMenus = document.querySelectorAll('.sort-menu');
  sortMenus.forEach(menu => {
    // Replace dummy options with real ones
    menu.innerHTML = `
      <div class="sort-option active" onclick="homeApi.setSort('name', 'Name'); closeSort(this.parentElement.id)">Name (A-Z)</div>
      <div class="sort-option" onclick="homeApi.setSort('rating', 'Rating'); closeSort(this.parentElement.id)">Rating: High → Low</div>
      <div class="sort-option" onclick="homeApi.setSort('delivery_time', 'Delivery Time'); closeSort(this.parentElement.id)">Delivery Time: Fast</div>
      <div class="sort-option" onclick="homeApi.setSort('delivery_price', 'Delivery Price'); closeSort(this.parentElement.id)">Delivery Price: Low</div>
    `;
  });

  // Setup search input bindings (in S5 Search screen)
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      // Debounce logic could go here, for now just load directly
      homeApi.load();
    });
  }

  // Load initially
  homeApi.load();
});
