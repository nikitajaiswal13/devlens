import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ApiError } from '../services/api';
import { CodeAnalysisPreview } from '../components/CodeAnalysisPreview';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [clientErrors, setClientErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // NOTE: Strictly sending only name, email, and password. confirmPassword is never passed.
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred during account provisioning');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-wrapper tech-grid-bg">
      <div className="auth-split-pane form-pane">
        <div className="auth-box">
          <header className="auth-brand-block">
            <div className="brand-lockup">
              <span className="brand-symbol">DL</span>
              <div className="brand-meta">
                <span className="brand-name-text">DevLens</span>
                <span className="brand-tagline-micro">Source Analysis & Architecture Review</span>
              </div>
            </div>

            <div className="headline-block">
              <h1 className="auth-main-headline">Register Engineer Account</h1>
              <p className="auth-tagline-quote">"Provision secure credentials for architectural telemetry."</p>
            </div>
          </header>

          {serverError && (
            <div className="tech-alert tech-alert-error" role="alert">
              <span className="alert-badge">ERR</span>
              <span className="alert-content">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="tech-form">
            <div className="form-field-group">
              <label htmlFor="register-name" className="field-label">
                <span>Name</span>
                <span className="field-spec">Primary identity</span>
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (clientErrors.name) setClientErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Ada Lovelace"
                className={`tech-input ${clientErrors.name ? 'input-invalid' : ''}`}
                disabled={isSubmitting}
              />
              {clientErrors.name && <div className="validation-error-msg">{clientErrors.name}</div>}
            </div>

            <div className="form-field-group">
              <label htmlFor="register-email" className="field-label">
                <span>Email</span>
                <span className="field-spec">RFC 5322</span>
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (clientErrors.email) setClientErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="you@example.com"
                className={`tech-input ${clientErrors.email ? 'input-invalid' : ''}`}
                disabled={isSubmitting}
              />
              {clientErrors.email && <div className="validation-error-msg">{clientErrors.email}</div>}
            </div>

            <div className="form-field-group">
              <div className="label-row-split">
                <label htmlFor="register-password" className="field-label">
                  <span>Password</span>
                </label>
                <div className="field-inline-actions">
                  <span className="field-spec">Min 8 chars</span>
                  <button
                    type="button"
                    className="inline-toggle-action"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '[HIDE]' : '[SHOW]'}
                  </button>
                </div>
              </div>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (clientErrors.password) setClientErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••••••"
                className={`tech-input ${clientErrors.password ? 'input-invalid' : ''}`}
                disabled={isSubmitting}
              />
              {clientErrors.password && <div className="validation-error-msg">{clientErrors.password}</div>}
            </div>

            <div className="form-field-group">
              <div className="label-row-split">
                <label htmlFor="register-confirm-password" className="field-label">
                  <span>Confirm Password</span>
                </label>
                <button
                  type="button"
                  className="inline-toggle-action"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? '[HIDE]' : '[SHOW]'}
                </button>
              </div>
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (clientErrors.confirmPassword) setClientErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="••••••••••••"
                className={`tech-input ${clientErrors.confirmPassword ? 'input-invalid' : ''}`}
                disabled={isSubmitting}
              />
              {clientErrors.confirmPassword && <div className="validation-error-msg">{clientErrors.confirmPassword}</div>}
            </div>

            <button
              type="submit"
              className="tech-primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-loading-state">
                  <span className="terminal-busy-indicator" />
                  PROVISIONING ACCOUNT...
                </span>
              ) : (
                'CREATE ACCOUNT →'
              )}
            </button>
          </form>

          <footer className="auth-box-footer">
            <span className="footer-prompt">Already provisioned?</span>
            <Link to="/login" className="tech-accent-link">
              Sign in to workspace
            </Link>
          </footer>
        </div>
      </div>

      <div className="auth-split-pane preview-pane">
        <div className="preview-container-inner">
          <div className="preview-narrative">
            <span className="narrative-badge">STATIC ANALYSIS & ARCHITECTURE REVIEW</span>
            <h2 className="narrative-heading">Automated code inspection and boundary protection</h2>
            <p className="narrative-body">
              Join DevLens to audit internal dependency graphs, eliminate architectural rot,
              and guarantee module isolation on every commit.
            </p>
          </div>
          <CodeAnalysisPreview />
        </div>
      </div>
    </div>
  );
};
