import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { AuthModal } from '../components/AuthModal';
import { ThemeToggle } from '../components/ThemeToggle';
import { LoginForm } from './LoginPage';
import { RegisterForm } from './RegisterPage';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [modalType, setModalType] = useState<'login' | 'register' | 'workspace' | null>(null);

  const handleOpenLogin = () => setModalType('login');
  const handleOpenRegister = () => setModalType('register');
  const handleOpenWorkspace = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setModalType('workspace');
    }
  };
  const handleCloseModal = () => setModalType(null);

  const handleAuthSuccess = () => {
    setModalType(null);
    navigate('/dashboard');
  };

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="landing-layout">
      {/* Navigation Bar */}
      <header className="landing-navbar">
        <div className="landing-navbar-container">
          <div className="landing-brand">
            <span className="brand-logo-sq">DL</span>
            <span className="landing-brand-name">DevLens</span>
          </div>

          <nav className="landing-nav-links">
            <button
              type="button"
              className="landing-nav-link"
              onClick={(e) => scrollToSection(e, 'features')}
            >
              Features
            </button>
            <button
              type="button"
              className="landing-nav-link"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
            >
              How It Works
            </button>
            <button
              type="button"
              className="landing-nav-link"
              onClick={(e) => scrollToSection(e, 'architecture')}
            >
              Architecture Roadmap
            </button>
            <button
              type="button"
              className="landing-nav-link"
              onClick={handleOpenWorkspace}
            >
              Workspace
            </button>
          </nav>

          <div className="landing-nav-actions">
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                Go to Workspace →
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-text"
                  onClick={handleOpenLogin}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleOpenRegister}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-main">
        <section className="landing-hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-bullet">•</span>
              <span>Intelligent Source Code Analysis</span>
            </div>
            <h1 className="hero-headline">
              Understand code structure. Detect issues before production.
            </h1>
            <p className="hero-subheadline">
              DevLens is a developer workbench built for deep static analysis and software quality inspection.
              Parse Abstract Syntax Trees, audit syntax and lint errors, and inspect structural metrics in seconds.
            </p>

            <div className="hero-cta-group">
              {isAuthenticated ? (
                <button
                  type="button"
                  className="btn-hero-primary"
                  onClick={() => navigate('/dashboard')}
                >
                  Open Analysis Workspace →
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-hero-primary"
                    onClick={handleOpenRegister}
                  >
                    Get Started Free
                  </button>
                  <button
                    type="button"
                    className="btn-hero-secondary"
                    onClick={handleOpenLogin}
                  >
                    Log in to Workspace
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Current Implemented Capabilities Section */}
        <section id="features" className="landing-section">
          <div className="section-container">
            <div className="section-header">
              <span className="section-kicker">STATIC ANALYSIS ENGINE</span>
              <h2 className="section-title">Production-grade static inspection</h2>
              <p className="section-description">
                Currently implemented and operating in DevLens Phase 2, powered by an in-memory Babel parser and ESLint engine.
              </p>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">λ</div>
                <h3 className="feature-title">AST Parsing & Traversal</h3>
                <p className="feature-text">
                  Direct Abstract Syntax Tree generation for JavaScript and JSX with strict error diagnostics. Accurately pinpoints syntax issues with exact line and column coordinates.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">✓</div>
                <h3 className="feature-title">Actionable Code Quality Findings</h3>
                <p className="feature-text">
                  Integrated in-memory linter detects unused variables, undefined references, unreachable statements, and duplicate arguments without running user code.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">#</div>
                <h3 className="feature-title">Comprehensive Code Metrics</h3>
                <p className="feature-text">
                  Instant breakdown of AST node counts, function declarations, function expressions, arrow functions, import and export counts, class declarations, and byte size.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="landing-section section-subtle">
          <div className="section-container">
            <div className="section-header">
              <span className="section-kicker">WORKFLOW</span>
              <h2 className="section-title">How DevLens analyzes your code</h2>
              <p className="section-description">
                A secure, non-evaluating pipeline designed for reproducible static analysis.
              </p>
            </div>

            <div className="workflow-steps-grid">
              <div className="workflow-step-card">
                <div className="step-number">01</div>
                <h4 className="step-title">Supply Source Code</h4>
                <p className="step-text">
                  Provide JavaScript or JSX code directly in the technical editor workbench with customized filename context.
                </p>
              </div>

              <div className="workflow-step-card">
                <div className="step-number">02</div>
                <h4 className="step-title">Parse & Traverse AST</h4>
                <p className="step-text">
                  Babel parser reads syntax safely without execution, generating the node tree and validating grammar rules.
                </p>
              </div>

              <div className="workflow-step-card">
                <div className="step-number">03</div>
                <h4 className="step-title">Inspect Diagnostics & Metrics</h4>
                <p className="step-text">
                  Review normalized issues, severity levels, rule identifiers, exact code positions, and structural complexity statistics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Roadmap Section */}
        <section id="architecture" className="landing-section">
          <div className="section-container">
            <div className="architecture-roadmap-box">
              <div className="roadmap-badge">UPCOMING CAPABILITY • MILESTONE 3</div>
              <h3 className="roadmap-title">Software Architecture & Dependency Review</h3>
              <p className="roadmap-text">
                Future phases will extend DevLens beyond file-level static analysis into project-wide architecture review: module dependency graphs, circular coupling detection, package instability ratings, and architectural boundary enforcement.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="landing-cta-section">
          <div className="section-container">
            <div className="cta-banner">
              <h2 className="cta-heading">Ready to inspect your codebase?</h2>
              <p className="cta-subheading">
                Sign up for an account to access the DevLens analysis workbench.
              </p>
              <div className="cta-actions">
                {isAuthenticated ? (
                  <button
                    type="button"
                    className="btn-hero-primary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Return to Dashboard →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-hero-primary"
                    onClick={handleOpenRegister}
                  >
                    Create Free Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div className="footer-left">
            <span className="brand-logo-sq small">DL</span>
            <span className="footer-brand-title">DevLens</span>
            <span className="footer-copy">— Intelligent Source Code Analysis Platform</span>
          </div>
          <div className="footer-right">
            <span>Engineering Milestone Phase 2</span>
          </div>
        </div>
      </footer>

      {/* Workspace Selection Dialog */}
      <AuthModal
        isOpen={modalType === 'workspace'}
        onClose={handleCloseModal}
        title="Access DevLens Workspace"
      >
        <div className="workspace-modal-card">
          <header className="workspace-modal-header">
            <div className="auth-brand-mark">
              <span className="brand-logo-sq">DL</span>
              <span className="brand-product-title">DevLens Workspace</span>
            </div>
            <h2 className="workspace-modal-title">Access Workspace</h2>
            <p className="workspace-modal-subtext">
              Sign in with your existing account or create a new account to enter the code analysis workbench.
            </p>
          </header>

          <div className="workspace-options-grid">
            <button
              type="button"
              className="workspace-choice-card"
              onClick={handleOpenLogin}
            >
              <div className="workspace-choice-header">
                <span className="choice-title">Log in</span>
                <span className="choice-arrow">→</span>
              </div>
              <p className="choice-description">
                Sign in to your existing DevLens developer account.
              </p>
            </button>

            <button
              type="button"
              className="workspace-choice-card"
              onClick={handleOpenRegister}
            >
              <div className="workspace-choice-header">
                <span className="choice-title">Sign up</span>
                <span className="choice-arrow">→</span>
              </div>
              <p className="choice-description">
                Create a new developer account to begin static source inspection.
              </p>
            </button>
          </div>
        </div>
      </AuthModal>

      {/* Authentication Modals */}
      <AuthModal
        isOpen={modalType === 'login'}
        onClose={handleCloseModal}
        title="Sign in to DevLens"
      >
        <LoginForm
          isModal
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setModalType('register')}
        />
      </AuthModal>

      <AuthModal
        isOpen={modalType === 'register'}
        onClose={handleCloseModal}
        title="Create DevLens Account"
      >
        <RegisterForm
          isModal
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setModalType('login')}
        />
      </AuthModal>
    </div>
  );
};
