import React from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title || 'Authentication'}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="auth-modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};
