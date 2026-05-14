import bcrypt from 'bcryptjs';
import { UserStore } from '../models/user.model';

// ─── Validation Helpers ───────────────────────────────────────────────────────

/**
 * UA-FR-03 / UA-FR-05: Validate email format.
 * Returns an error string or null if valid.
 */
export function validateEmailFormat(email: string): string | null {
  if (!email || email.trim().length === 0) {
    return "Email can't be empty";                              // UA-FR-05
  }
  // Must have @ sign and a valid domain (at least one dot after @)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Invalid email';                                     // UA-FR-03
  }
  return null;
}

/**
 * UA-FR-02 / UA-FR-06: Validate password against all 5 constraints.
 * Returns an error string or null if valid.
 */
export function validatePasswordFormat(password: string): string | null {
  if (!password || password.length === 0) {
    return "Password field can't be empty";                     // UA-FR-06
  }
  const errors: string[] = [];
  if (password.length < 8 || password.length > 64) {
    errors.push('8–64 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    errors.push('one special character');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('one number');
  }
  if (errors.length > 0) {
    return 'Password must contain: ' + errors.join(', ');      // UA-FR-02
  }
  return null;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export interface RegisterResult {
  success: boolean;
  error?: string;
}

export interface LoginResult {
  success: boolean;
  isAdmin?: boolean;
  error?: string;
}

const SALT_ROUNDS = 10;

/**
 * UA-FR-01: Register a new user.
 * Validates email uniqueness and password constraints before creating the account.
 */
export async function register(
  email: string,
  password: string
): Promise<RegisterResult> {
  // Validate email format
  const emailError = validateEmailFormat(email);
  if (emailError) return { success: false, error: emailError };

  // Validate password format (all 5 constraints)
  const passwordError = validatePasswordFormat(password);
  if (passwordError) return { success: false, error: passwordError };

  // UA-FR-04: Check email uniqueness
  if (UserStore.emailExists(email.trim())) {
    return { success: false, error: 'Email already registered' };
  }

  // Hash password and store user
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  UserStore.add({
    email: email.trim().toLowerCase(),
    passwordHash,
    isAdmin: false,   // default per class diagram
  });

  return { success: true };
}

/**
 * LG-FR-01: Authenticate a registered user.
 * All login failures return the same generic message (LG-FR-02, 03, 04).
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const GENERIC_ERROR = 'Check email and password again';

  // LG-FR-02: Email not registered
  const user = UserStore.findByEmail(email.trim());
  if (!user) {
    return { success: false, error: GENERIC_ERROR };
  }

  // LG-FR-03 / LG-FR-04: Wrong password (covers wrongly typed email too since
  //   email must match exactly; bcrypt compare handles the password check)
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return { success: false, error: GENERIC_ERROR };
  }

  return { success: true, isAdmin: user.isAdmin };
}
