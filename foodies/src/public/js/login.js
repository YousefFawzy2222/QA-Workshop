/**
 * login.js – Client-side logic for the Login page
 *
 * LG-FR-01: Authenticate with email + password via API
 * LG-FR-02: Unregistered email → "Check email and password again"
 * LG-FR-03: Wrongly typed registered email → same generic message
 * LG-FR-04: Incorrect password → same generic message
 * LG-FR-05: Errors appear ONLY after the user clicks submit, NOT in real-time
 */

// ─── DOM References ───────────────────────────────────────────────────────────
const form         = document.getElementById('login-form');
const emailInput   = document.getElementById('login-email');
const passwordInput= document.getElementById('login-password');
const errorBox     = document.getElementById('login-error-box');
const submitBtn    = document.getElementById('login-btn');
const toggleBtn    = document.getElementById('toggle-login-password');
const eyeOpen      = document.getElementById('login-eye-open');
const eyeClosed    = document.getElementById('login-eye-closed');

// ─── Password Toggle ──────────────────────────────────────────────────────────
toggleBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  eyeOpen.style.display   = isPassword ? 'none'  : 'block';
  eyeClosed.style.display = isPassword ? 'block' : 'none';
});

// ─── Helper: show / hide error box ───────────────────────────────────────────
function showLoginError(message) {
  errorBox.textContent = message;
  errorBox.classList.add('visible');
  emailInput.classList.add('is-error');
  passwordInput.classList.add('is-error');
}

function clearLoginError() {
  errorBox.classList.remove('visible');
  emailInput.classList.remove('is-error');
  passwordInput.classList.remove('is-error');
}

// LG-FR-05: Clear error when user starts typing again (AFTER a failed submit)
emailInput.addEventListener('input', clearLoginError);
passwordInput.addEventListener('input', clearLoginError);

// ─── Form Submit ──────────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  clearLoginError();

  // Show loading state
  submitBtn.classList.add('loading');
  submitBtn.textContent = 'Signing in…';
  submitBtn.disabled = true;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:    emailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Successful login → redirect to home (or admin panel)
      window.location.href = data.isAdmin ? '/admin.html' : '/home.html';
    } else {
      // LG-FR-02 / LG-FR-03 / LG-FR-04: Show the generic error message
      showLoginError(data.error || 'Check email and password again');
    }
  } catch (err) {
    showLoginError('Network error. Please try again.');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.textContent = 'Log in';
    submitBtn.disabled = false;
  }
});
