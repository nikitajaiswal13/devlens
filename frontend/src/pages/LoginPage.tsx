import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ApiError } from '../services/api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  isModal?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  isModal = false,
}) => {
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
      errors.email = 'Email address is required';
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
      if (onSuccess) {
        onSuccess();
      } else {
        const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
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
    <div className={`auth-form-card ${isModal ? 'in-modal' : ''}`}>

      <header className="auth-card-header">
        <div className="auth-brand-mark">
          <span className="brand-logo-sq">DL</span>
          <span className="brand-product-title">DevLens</span>
        </div>
        <h1 className="auth-card-heading">Sign in</h1>
        <p className="auth-card-subheading">
          Intelligent source code analysis and architecture review
        </p>
      </header>

      {serverError && (
        <div className="form-alert-banner error" role="alert">
          <span className="alert-message">{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="auth-input-form">
        <div className="form-row">
          <label htmlFor="login-email" className="form-field-label">
            Email
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
            className={`form-text-input ${clientErrors.email ? 'input-error' : ''}`}
            disabled={isSubmitting}
          />
          {clientErrors.email && <span className="form-validation-error">{clientErrors.email}</span>}
        </div>

        <div className="form-row">
          <div className="form-label-with-action">
            <label htmlFor="login-password" className="form-field-label">
              Password
            </label>
            <button
              type="button"
              className="password-toggle-link"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
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
            className={`form-text-input ${clientErrors.password ? 'input-error' : ''}`}
            disabled={isSubmitting}
          />
          {clientErrors.password && <span className="form-validation-error">{clientErrors.password}</span>}
        </div>

        <button
          type="submit"
          className="form-submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <footer className="auth-card-footer">
        <span>Don't have an account?</span>
        {onSwitchToRegister ? (
          <button
            type="button"
            className="auth-switch-btn"
            onClick={onSwitchToRegister}
          >
            Create an account
          </button>
        ) : (
          <Link to="/register" className="auth-switch-link">
            Create an account
          </Link>
        )}
      </footer>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  return (
    <div className="auth-page-container">
      <LoginForm />
    </div>
  );
};
