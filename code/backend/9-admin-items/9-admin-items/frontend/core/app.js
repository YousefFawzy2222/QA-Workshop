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

  // Hide or show Admin tab based on user privileges
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const adminNavBtn = document.querySelector('button.nav-link[onclick="go(17)"]');
  if (adminNavBtn) {
    adminNavBtn.style.display = isAdmin ? '' : 'none';
  }

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
    const val = this.value;
    const err = document.getElementById('signup-email-err');
    if (val.length === 0) {
      // DEF_UA_001 / DEF_UA_013: Show error for empty email in real time
      err.textContent = "Email can't be empty";
      err.style.display = 'flex';
      this.classList.add('error');
    } else {
      // DEF_UA_002 / DEF_UA_003 / DEF_UA_015: Validate email format, show "Invalid email"
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!valid) {
        err.textContent = 'Invalid email';
        err.style.display = 'flex';
        this.classList.add('error');
      } else {
        // DEF_UA_014: Clear error when input is corrected
        err.style.display = 'none';
        this.classList.remove('error');
      }
    }
  });

  // Also validate on blur for empty field detection
  signupEmail.addEventListener('blur', function() {
    const val = this.value;
    const err = document.getElementById('signup-email-err');
    if (val.length === 0) {
      err.textContent = "Email can't be empty";
      err.style.display = 'flex';
      this.classList.add('error');
    }
  });
}

if (signupPass) {
  signupPass.addEventListener('input', function() {
    const val = this.value;
    const err = document.getElementById('signup-pass-err');
    const constraintsBox = document.getElementById('signup-pass-constraints');

    if (val.length === 0) {
      // DEF_UA_001 / DEF_UA_013: Show empty password error
      err.textContent = "Password can't be empty";
      err.style.display = 'flex';
      this.classList.add('error');
      if (constraintsBox) constraintsBox.style.display = 'none';
      return;
    }

    // DEF_UA_004-010, DEF_UA_012: Real-time password constraint validation
    const hasLen = val.length >= 8 && val.length <= 64;
    const hasUpper = /[A-Z]/.test(val);
    const hasLower = /[a-z]/.test(val);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(val);
    const hasNumber = /[0-9]/.test(val);

    // Update constraint checklist indicators
    const updateIndicator = function(id, passed) {
      const el = document.getElementById(id);
      if (!el) return;
      if (passed) {
        el.style.color = '#27ae60';
        el.textContent = '✓ ' + el.textContent.substring(2);
      } else {
        el.style.color = '#e74c3c';
        el.textContent = '✗ ' + el.textContent.substring(2);
      }
    };

    if (constraintsBox) constraintsBox.style.display = 'block';
    updateIndicator('pw-len', hasLen);
    updateIndicator('pw-upper', hasUpper);
    updateIndicator('pw-lower', hasLower);
    updateIndicator('pw-special', hasSpecial);
    updateIndicator('pw-number', hasNumber);

    const allValid = hasLen && hasUpper && hasLower && hasSpecial && hasNumber;
    if (!allValid) {
      // DEF_UA_004-010, DEF_UA_012: Show "Invalid password" with constraints listed
      err.textContent = 'Invalid password';
      err.style.display = 'flex';
      this.classList.add('error');
    } else {
      // DEF_UA_014: Clear error when input is corrected
      err.style.display = 'none';
      this.classList.remove('error');
    }
  });

  // Also validate on blur for empty field detection
  signupPass.addEventListener('blur', function() {
    const val = this.value;
    const err = document.getElementById('signup-pass-err');
    if (val.length === 0) {
      err.textContent = "Password can't be empty";
      err.style.display = 'flex';
      this.classList.add('error');
    }
  });
}
