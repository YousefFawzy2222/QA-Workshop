const authApi = {
  async register(email, password) {
    return apiClient.post('/auth/register', { email, password });
  },
  async login(email, password) {
    return apiClient.post('/auth/login', { email, password });
  },
  logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    go(0); // Go back to signup
  }
};

// Bind to UI elements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // S0: Sign Up
  const signupBtn = document.querySelector('#s0 .btn-primary');
  const signupEmail = document.getElementById('signup-email');
  const signupPass = document.getElementById('signup-pass');
  const signupEmailErr = document.getElementById('signup-email-err');
  const signupPassErr = document.getElementById('signup-pass-err');

  if (signupBtn) {
    signupBtn.onclick = async (e) => {
      e.preventDefault();
      signupEmailErr.style.display = 'none';
      signupPassErr.style.display = 'none';
      signupEmail.classList.remove('error');
      signupPass.classList.remove('error');
      
      const email = signupEmail.value.trim();
      const pass = signupPass.value;

      // DEF_UA_001 / DEF_UA_013: Client-side empty field validation
      let hasError = false;
      if (email.length === 0) {
        signupEmailErr.textContent = "Email can't be empty";
        signupEmailErr.style.display = 'block';
        signupEmail.classList.add('error');
        hasError = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        signupEmailErr.textContent = 'Invalid email';
        signupEmailErr.style.display = 'block';
        signupEmail.classList.add('error');
        hasError = true;
      }

      if (pass.length === 0) {
        signupPassErr.textContent = "Password can't be empty";
        signupPassErr.style.display = 'block';
        signupPass.classList.add('error');
        hasError = true;
      } else {
        // DEF_UA_004-010, DEF_UA_012: Validate password constraints
        const hasLen = pass.length >= 8 && pass.length <= 64;
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        if (!(hasLen && hasUpper && hasLower && hasSpecial && hasNumber)) {
          signupPassErr.textContent = 'Invalid password';
          signupPassErr.style.display = 'block';
          signupPass.classList.add('error');
          hasError = true;
        }
      }

      if (hasError) return;

      const res = await authApi.register(email, pass);
      if (res.ok) {
        // Automatically login or go to login screen
        go(1); // switch to S1 Login
      } else {
        // DEF_UA_011: Show "Email already in use" from server
        if (res.data.error && res.data.error.toLowerCase().includes('email')) {
          signupEmailErr.textContent = res.data.error;
          signupEmailErr.style.display = 'block';
          signupEmail.classList.add('error');
        } else {
          signupPassErr.textContent = res.data.error;
          signupPassErr.style.display = 'block';
          signupPass.classList.add('error');
        }
      }
    };
  }

  // S1: Log In
  const loginBtn = document.querySelector('#s1 .btn-primary');
  const loginEmail = document.getElementById('login-email');
  const loginPass = document.getElementById('login-pass');

  if (loginBtn) {
    loginBtn.onclick = async (e) => {
      e.preventDefault();
      const email = loginEmail.value;
      const pass = loginPass.value;

      const res = await authApi.login(email, pass);
      if (res.ok) {
        localStorage.setItem('userEmail', email);
        if (res.data.isAdmin) {
          localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.removeItem('isAdmin');
        }
        
        // Load actual data before going to Home screen
        if (window.restaurantApi) {
          await restaurantApi.loadRestaurants();
        }
        go(3); // switch to S3 Home
      } else {
        // Show generic login error screen (S2)
        const errorEmail = document.querySelector('#s2 input[type="email"]');
        if (errorEmail) errorEmail.value = email;
        go(2); // S2 error screen
      }
    };
  }
});
