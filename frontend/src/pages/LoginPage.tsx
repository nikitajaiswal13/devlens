import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ApiError } from '../services/api';
import { CodeAnalysisPreview } from '../components/CodeAnalysisPreview';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientErrors, setClientErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
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
      await login({ email: email.trim(), password });
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred during login');
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
              <h1 className="auth-main-headline">Sign in to DevLens</h1>
              <p className="auth-tagline-quote">"Your codebase, understood."</p>
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
              <label htmlFor="login-email" className="field-label">
                <span>Email</span>
                <span className="field-spec">RFC 5322</span>
              </label>
              <input
                id="login-email"
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
                <label htmlFor="login-password" className="field-label">
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  className="inline-toggle-action"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '[HIDE]' : '[SHOW]'}
                </button>
              </div>
              <div className="input-with-inline-action">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (clientErrors.password) setClientErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••••••"
                  className={`tech-input ${clientErrors.password ? 'input-invalid' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {clientErrors.password && <div className="validation-error-msg">{clientErrors.password}</div>}
            </div>

            <button
              type="submit"
              className="tech-primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-loading-state">
                  <span className="terminal-busy-indicator" />
                  AUTHENTICATING SESSION...
                </span>
              ) : (
                'CONTINUE TO WORKSPACE →'
              )}
            </button>
          </form>

          <footer className="auth-box-footer">
            <span className="footer-prompt">Need an authorized workspace?</span>
            <Link to="/register" className="tech-accent-link">
              Create an account
            </Link>
          </footer>
        </div>
      </div>

      <div className="auth-split-pane preview-pane">
        <div className="preview-container-inner">
          <div className="preview-narrative">
            <span className="narrative-badge">STATIC ANALYSIS & ARCHITECTURE REVIEW</span>
            <h2 className="narrative-heading">Rigorous AST analysis and modular boundaries</h2>
            <p className="narrative-body">
              DevLens evaluates software architecture through automated AST parsing, cyclic dependency
              detection, afferent coupling calculations, and layer-isolation rules.
            </p>
          </div>
          <CodeAnalysisPreview />
        </div>
      </div>
    </div>
  );
};
