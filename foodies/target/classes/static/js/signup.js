/**
 * signup.js – Client-side logic for the Signup page
 *
 * UA-FR-08: Real-time validation on field change (input event)
 * UA-FR-07: All errors appear inline, directly under the field
 * UA-FR-03: Invalid email → "Invalid email"
 * UA-FR-05: Empty email → "Email can't be empty"
 * UA-FR-06: Empty password → "Password field can't be empty"
 * UA-FR-02: Password must meet all 5 constraints
 * UA-FR-01: On success → redirect to login page
 */

// ─── DOM References ───────────────────────────────────────────────────────────
const form         = document.getElementById('signup-form');
const emailInput   = document.getElementById('signup-email');
const passwordInput= document.getElementById('signup-password');
const emailError   = document.getElementById('signup-email-error');
const passwordError= document.getElementById('signup-password-error');
const submitBtn    = document.getElementById('signup-btn');
const toggleBtn    = document.getElementById('toggle-signup-password');
const eyeOpen      = document.getElementById('eye-open');
const eyeClosed    = document.getElementById('eye-closed');

// Constraint hint elements
const hintLength   = document.getElementById('hint-length');
const hintUpper    = document.getElementById('hint-upper');
const hintLower    = document.getElementById('hint-lower');
const hintSpecial  = document.getElementById('hint-special');
const hintNumber   = document.getElementById('hint-number');

// ─── Helper: show / clear field error ────────────────────────────────────────
function showError(el, input, message) {
  el.textContent = message;
  input.classList.add('is-error');
  input.setAttribute('aria-invalid', 'true');
}

function clearError(el, input) {
  el.textContent = '';
  input.classList.remove('is-error');
  input.removeAttribute('aria-invalid');
}

// ─── Email Validation (UA-FR-03, UA-FR-05) ───────────────────────────────────
function validateEmail() {
  const value = emailInput.value;

  if (value.trim().length === 0) {
    showError(emailError, emailInput, "Email can't be empty");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    showError(emailError, emailInput, 'Invalid email');
    return false;
  }

  clearError(emailError, emailInput);
  return true;
}

// ─── Password Validation (UA-FR-02, UA-FR-06) ────────────────────────────────
function validatePassword() {
  const value = passwordInput.value;

  if (value.length === 0) {
    showError(passwordError, passwordInput, "Password field can't be empty");
    updateHints('');
    return false;
  }

  updateHints(value);

  const checks = {
    length:  value.length >= 8 && value.length <= 64,
    upper:   /[A-Z]/.test(value),
    lower:   /[a-z]/.test(value),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value),
    number:  /[0-9]/.test(value),
  };

  const allMet = Object.values(checks).every(Boolean);

  if (!allMet) {
    showError(passwordError, passwordInput, 'Password does not meet all requirements');
    return false;
  }

  clearError(passwordError, passwordInput);
  return true;
}

// ─── Update Constraint Hint UI ────────────────────────────────────────────────
function updateHints(value) {
  setHint(hintLength,  value.length >= 8 && value.length <= 64);
  setHint(hintUpper,   /[A-Z]/.test(value));
  setHint(hintLower,   /[a-z]/.test(value));
  setHint(hintSpecial, /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value));
  setHint(hintNumber,  /[0-9]/.test(value));
}

function setHint(el, met) {
  if (met) {
    el.classList.add('met');
  } else {
    el.classList.remove('met');
  }
}

// ─── Real-time listeners (UA-FR-08) ──────────────────────────────────────────
emailInput.addEventListener('input', validateEmail);
passwordInput.addEventListener('input', validatePassword);

// Also validate on blur for UX polish
emailInput.addEventListener('blur', () => {
  if (emailInput.value.length > 0) validateEmail();
});

// ─── Password Toggle ──────────────────────────────────────────────────────────
toggleBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  eyeOpen.style.display   = isPassword ? 'none'  : 'block';
  eyeClosed.style.display = isPassword ? 'block' : 'none';
});

// ─── Form Submit (UA-FR-01) ───────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate both fields before submitting
  const emailOk    = validateEmail();
  const passwordOk = validatePassword();

  if (!emailOk || !passwordOk) return;

  // Show loading state
  submitBtn.classList.add('loading');
  submitBtn.textContent = 'Creating account…';
  submitBtn.disabled = true;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:    emailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // UA-FR-01: Redirect to login after successful registration
      window.location.href = '/login.html';
    } else {
      // Show server-returned error (e.g. duplicate email) inline under email field
      if (data.error && data.error.toLowerCase().includes('email')) {
        showError(emailError, emailInput, data.error);
      } else if (data.error && data.error.toLowerCase().includes('password')) {
        showError(passwordError, passwordInput, data.error);
      } else {
        showError(emailError, emailInput, data.error || 'Something went wrong. Please try again.');
      }
    }
  } catch (err) {
    showError(emailError, emailInput, 'Network error. Please try again.');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.textContent = 'Sign up';
    submitBtn.disabled = false;
  }
});
