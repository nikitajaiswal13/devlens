import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ApiError } from '../services/api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  isModal?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  isModal = false,
}) => {
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
      errors.name = 'Name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
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
      // NOTE: Strictly sending only name, email, and password. confirmPassword is never passed to backend.
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred during registration');
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
        <h1 className="auth-card-heading">Create account</h1>
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
          <label htmlFor="register-name" className="form-field-label">
            Full Name
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
            className={`form-text-input ${clientErrors.name ? 'input-error' : ''}`}
            disabled={isSubmitting}
          />
          {clientErrors.name && <span className="form-validation-error">{clientErrors.name}</span>}
        </div>

        <div className="form-row">
          <label htmlFor="register-email" className="form-field-label">
            Email
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
            className={`form-text-input ${clientErrors.email ? 'input-error' : ''}`}
            disabled={isSubmitting}
          />
          {clientErrors.email && <span className="form-validation-error">{clientErrors.email}</span>}
        </div>

        <div className="form-row">
          <div className="form-label-with-action">
            <label htmlFor="register-password" className="form-field-label">
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
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (clientErrors.password) setClientErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="At least 8 characters"
            className={`form-text-input ${clientErrors.password ? 'input-error' : ''}`}
            disabled={isSubmitting}
          />
          {clientErrors.password && <span className="form-validation-error">{clientErrors.password}</span>}
        </div>

        <div className="form-row">
          <div className="form-label-with-action">
            <label htmlFor="register-confirm-password" className="form-field-label">
              Confirm Password
            </label>
            <button
              type="button"
              className="password-toggle-link"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
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
            placeholder="Re-enter password"
            className={`form-text-input ${clientErrors.confirmPassword ? 'input-error' : ''}`}
            disabled={isSubmitting}
          />
          {clientErrors.confirmPassword && <span className="form-validation-error">{clientErrors.confirmPassword}</span>}
        </div>

        <button
          type="submit"
          className="form-submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <footer className="auth-card-footer">
        <span>Already have an account?</span>
        {onSwitchToLogin ? (
          <button
            type="button"
            className="auth-switch-btn"
            onClick={onSwitchToLogin}
          >
            Sign in
          </button>
        ) : (
          <Link to="/login" className="auth-switch-link">
            Sign in
          </Link>
        )}
      </footer>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  return (
    <div className="auth-page-container">
      <RegisterForm />
    </div>
  );
};
