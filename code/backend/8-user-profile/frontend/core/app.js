// ═══════════════════════════════════════════
// FoodApp — Navigation & Interaction Logic
// ═══════════════════════════════════════════

const screenMeta = {
  0:  { title: 'Sign up',         loc: false, cart: false, av: false },
  1:  { title: 'Log in',          loc: false, cart: false, av: false },
  2:  { title: 'Login error',     loc: false, cart: false, av: false },
  3:  { title: 'Home',            loc: true,  cart: true,  av: true  },
  4:  { title: 'No restaurants',  loc: true,  cart: false, av: true  },
  5:  { title: 'Search',          loc: true,  cart: true,  av: true  },
  6:  { title: 'Offers',          loc: true,  cart: true,  av: true  },
  7:  { title: 'Restaurant menu', loc: true,  cart: true,  av: true  },
  8:  { title: 'Add to cart',     loc: true,  cart: true,  av: true  },
  9:  { title: 'Cart',            loc: true,  cart: false, av: true  },
  10: { title: 'Checkout',        loc: true,  cart: false, av: true  },
  11: { title: 'Order confirmed', loc: true,  cart: false, av: true  },
  12: { title: 'My account',      loc: false, cart: false, av: true  },
  13: { title: 'Personal info',   loc: false, cart: false, av: true  },
  14: { title: 'Saved address',   loc: false, cart: false, av: true  },
  16: { title: 'Loyalty & rewards', loc: false, cart: false, av: true },
  17: { title: 'Admin panel',     loc: false, cart: false, av: true  },
  18: { title: 'Home',            loc: true,  cart: false, av: true  }
};

// Screen-to-nav-index mapping for active state
const screenNavMap = {
  0: 0, 1: 1, 2: 1, 3: 2, 18: 2, 4: 2,
  5: 3, 6: 4, 7: 5, 8: 5, 9: 6, 10: 7,
  11: 7, 12: 8, 13: 8, 14: 8, 16: 9, 17: 10
};

function go(id) {
  const isAuth = id < 3;
  
  // Toggle sidebar sections
  document.getElementById('auth-nav').classList.toggle('hidden', !isAuth);
  document.getElementById('app-nav').classList.toggle('hidden', isAuth);

  // Toggle screens
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.toggle('active', s.id === 's' + id);
  });

  // Toggle sidebar active
  const navContainer = isAuth ? document.getElementById('auth-nav') : document.getElementById('app-nav');
  const navLinks = navContainer.querySelectorAll('.nav-link');
  
  // Special case: we need to find which link corresponds to the ID
  // Since I don't have IDs on buttons, I'll rely on a data-attribute or index if possible
  // But let's just use the screenNavMap and select from the visible container
  
  const allNavLinks = document.querySelectorAll('.nav-link');
  allNavLinks.forEach(n => n.classList.remove('active'));
  
  // We'll use a simpler approach: find the button with the matching onclick value
  allNavLinks.forEach(btn => {
    if (btn.getAttribute('onclick') === `go(${id})`) {
      btn.classList.add('active');
    }
  });

  // Reset scroll
  document.querySelector('.content').scrollTop = 0;

  // Update topbar
  const m = screenMeta[id];
  if (!m) return;
  document.getElementById('topbar-title').textContent = m.title;

  const cart = document.getElementById('topbar-cart');
  const av = document.getElementById('topbar-avatar');

  cart.classList.toggle('hidden', !m.cart);
  av.classList.toggle('hidden', !m.av);

  // Modal trigger
  if (id === 8) openModal();

  // Load screen data
  if (id === 3 || id === 18) {
    if (window.homeApi) homeApi.load();
  } else if (id === 5) {
    if (window.homeApi) homeApi.search();
  } else if (id === 6) {
    if (window.homeApi) homeApi.loadOffers();
  } else if (id === 7) {
    if (window.shopApi && shopApi.currentRestaurant) shopApi.loadRestaurant(shopApi.currentRestaurant.id);
  } else if (id === 9) {
    if (window.shopApi) shopApi.renderCart();
  } else if (id === 10) {
    if (window.shopApi) shopApi.renderCheckout();
  } else if (id === 12) {
    if (window.shopApi) shopApi.renderAccount();
  } else if (id === 13) {
    if (window.shopApi) shopApi.renderPersonalInfo();
  } else if (id === 16) {
    if (window.shopApi) shopApi.renderLoyalty();
  } else if (id === 17) {
    if (window.adminApi) adminApi.load();
  }
  if (window.shopApi) shopApi.updateCartBadge();
}

// Initialize on load
window.onload = () => {
  // Start with sign up
  go(0);
};

function openModal() {
  document.getElementById('cartModal').classList.add('open');
}
function closeModal() {
  document.getElementById('cartModal').classList.remove('open');
}

function toggleSort(id) {
  document.getElementById(id).classList.toggle('open');
}
function closeSort(id) {
  document.getElementById(id).classList.remove('open');
}

// Close sort dropdowns on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('.sort-wrap')) {
    document.querySelectorAll('.sort-menu').forEach(m => m.classList.remove('open'));
  }
});

// Close modal on overlay click
document.getElementById('cartModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Real-time validation for signup
const signupEmail = document.getElementById('signup-email');
const signupPass = document.getElementById('signup-pass');

if (signupEmail) {
  signupEmail.addEventListener('input', function() {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
    const err = document.getElementById('signup-email-err');
    if (this.value.length > 0 && !valid) {
      this.classList.add('error');
      err.style.display = 'flex';
    } else {
      this.classList.remove('error');
      err.style.display = 'none';
    }
  });
}

if (signupPass) {
  signupPass.addEventListener('input', function() {
    const err = document.getElementById('signup-pass-err');
    if (this.value.length === 0) {
      err.style.display = 'flex';
      this.classList.add('error');
    } else {
      err.style.display = 'none';
      this.classList.remove('error');
    }
  });
}
