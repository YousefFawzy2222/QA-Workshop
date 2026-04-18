'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Real-time validation (UA-FR-08)
  const validateEmailField = (val: string) => {
    if (!val) return "Email can't be empty";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(val)) return 'Invalid email';
    return '';
  };

  const passwordChecks = {
    length: password.length >= 8 && password.length <= 64,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    const err = validateEmailField(val);
    setErrors((prev) => ({ ...prev, email: err }));
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (!val) {
      setErrors((prev) => ({ ...prev, password: "Password field can't be empty" }));
    } else {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const emailErr = validateEmailField(email);
    if (emailErr) newErrors.email = emailErr;

    if (!password) {
      newErrors.password = "Password field can't be empty";
    } else if (!Object.values(passwordChecks).every(Boolean)) {
      newErrors.password = 'Password does not meet all requirements';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors || { general: data.error });
      } else {
        router.push('/login');
      }
    } catch {
      setErrors({ general: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container slide-up">
        <div className="auth-logo">FoodApp</div>
        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join us to start ordering amazing food</p>

          {errors.general && <div className="error-banner">{errors.general}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                id="signup-email"
                type="text"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => handleEmailChange(email)}
              />
              {errors.email && <div className="form-error">⚠ {errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="signup-password"
                type="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Create a password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => handlePasswordChange(password)}
              />
              {errors.password && <div className="form-error">⚠ {errors.password}</div>}

              <div className="password-checklist">
                <div className="password-checklist-title">Password requirements (All must be met)</div>
                <div className={`password-check ${passwordChecks.length ? 'valid' : ''}`}>
                  <span className="check-icon">{passwordChecks.length ? '✓' : '○'}</span>
                  8 to 64 characters
                </div>
                <div className={`password-check ${passwordChecks.upper ? 'valid' : ''}`}>
                  <span className="check-icon">{passwordChecks.upper ? '✓' : '○'}</span>
                  1 uppercase letter
                </div>
                <div className={`password-check ${passwordChecks.lower ? 'valid' : ''}`}>
                  <span className="check-icon">{passwordChecks.lower ? '✓' : '○'}</span>
                  1 lowercase letter
                </div>
                <div className={`password-check ${passwordChecks.special ? 'valid' : ''}`}>
                  <span className="check-icon">{passwordChecks.special ? '✓' : '○'}</span>
                  1 special character
                </div>
                <div className={`password-check ${passwordChecks.number ? 'valid' : ''}`}>
                  <span className="check-icon">{passwordChecks.number ? '✓' : '○'}</span>
                  1 number
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input
                id="signup-confirm-password"
                type="password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && <div className="form-error">⚠ {errors.confirmPassword}</div>}
            </div>

            <button id="signup-submit" type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link href="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
