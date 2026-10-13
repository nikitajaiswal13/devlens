import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const LogoutPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve origin route if stored in location state, or fallback to /dashboard
  const returnUrl = (location.state as { from?: string } | null)?.from || '/dashboard';

  const handleCancel = () => {
    navigate(returnUrl, { replace: true });
  };

  const handleConfirmLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="logout-screen-wrapper tech-grid-bg">
      <div className="logout-card" role="dialog" aria-labelledby="logout-title" aria-describedby="logout-desc">
        <header className="logout-header">
          <div className="logout-brand-row">
            <span className="logout-brand-badge">DL</span>
            <span className="logout-brand-text">DevLens Platform</span>
          </div>
          <h1 id="logout-title" className="logout-heading">Sign Out Confirmation</h1>
          <p id="logout-desc" className="logout-subtext">
            Are you sure you want to end your active session on DevLens?
          </p>
        </header>

        <section className="logout-session-meta">
          <div className="logout-meta-row">
            <span className="meta-label">CURRENT USER</span>
            <span className="meta-value">{user?.name || 'Engineer'}</span>
          </div>
          <div className="logout-meta-row">
            <span className="meta-label">AUTHENTICATED EMAIL</span>
            <span className="meta-value">{user?.email || '—'}</span>
          </div>
          <div className="logout-meta-row">
            <span className="meta-label">TOKEN SCOPE</span>
            <span className="meta-value">sessionStorage (Bearer JWT)</span>
          </div>
        </section>

        <div className="logout-note">
          <span className="note-icon">ℹ</span>
          <span>Signing out will revoke your active session and return you to the home page. Any unsaved code in the editor buffer will be cleared.</span>
        </div>

        <footer className="logout-actions">
          <button
            type="button"
            className="logout-btn-stay"
            onClick={handleCancel}
            autoFocus
          >
            Stay Logged In
          </button>
          <button
            type="button"
            className="logout-btn-confirm"
            onClick={handleConfirmLogout}
          >
            Yes, Log Out
          </button>
        </footer>
      </div>
    </div>
  );
};
