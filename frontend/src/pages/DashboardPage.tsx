import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ThemeToggle } from '../components/ThemeToggle';
import { CodeAnalysisView } from './CodeAnalysisView';

type NavTab = 'overview' | 'code-analysis' | 'architecture-review' | 'history';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    navigate('/logout', { state: { from: location.pathname } });
  };

  return (
    <div className="workspace-shell">
      {/* Top Workspace Header */}
      <header className="workspace-topbar">
        <div className="topbar-left">
          <div className="workspace-brand">
            <span className="brand-logo-sq">DL</span>
            <span className="workspace-brand-name">DevLens</span>
          </div>
          <span className="topbar-separator">/</span>
          <span className="topbar-section-title">Project Workspace</span>
        </div>

        <div className="topbar-right">
          <ThemeToggle />
          <div className="user-profile-badge">
            <span className="user-display-name">{user?.name || user?.email || 'Developer'}</span>
          </div>
          <button
            type="button"
            onClick={handleLogoutClick}
            className="topbar-signout-btn"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="workspace-body">
        {/* Navigation Sidebar */}
        <aside className="workspace-sidebar">
          <div className="sidebar-section-title">Navigation</div>
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-tab-title">Overview</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'code-analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('code-analysis')}
            >
              <span className="nav-tab-title">Code Analysis</span>
              <span className="tab-badge active-badge">Ready</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'architecture-review' ? 'active' : ''}`}
              onClick={() => setActiveTab('architecture-review')}
            >
              <span className="nav-tab-title">Architecture Review</span>
              <span className="tab-badge">Soon</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <span className="nav-tab-title">Analysis History</span>
              <span className="tab-badge">Soon</span>
            </button>
          </nav>

          <div className="sidebar-footer-note">
            <p className="project-version">DevLens • Student Project</p>
          </div>
        </aside>

        {/* Primary Content Canvas */}
        <main className="workspace-canvas">
          {activeTab === 'overview' && (
            <div className="canvas-content-wrapper">
              {/* Simple, honest welcome header */}
              <section className="dashboard-welcome-card">
                <h1 className="welcome-heading">Welcome back, {user?.name || 'Developer'}</h1>
                <p className="welcome-description">
                  DevLens is a software engineering project for static source code inspection.
                  It uses Babel to generate Abstract Syntax Trees (AST) and ESLint to detect
                  real code quality issues such as unused variables and undefined references.
                </p>
              </section>

              {/* Primary Feature: Code Analysis */}
              <section className="primary-feature-card">
                <div className="primary-feature-header">
                  <div className="primary-feature-title-group">
                    <span className="feature-status-pill available">Active Module</span>
                    <h2 className="primary-feature-title">Source Code Analysis</h2>
                  </div>
                  <button
                    type="button"
                    className="btn-primary start-analysis-btn"
                    onClick={() => setActiveTab('code-analysis')}
                  >
                    Open Code Analysis →
                  </button>
                </div>
                <p className="primary-feature-desc">
                  Write or paste JavaScript/JSX code to run static analysis. DevLens parses the code
                  into an AST, extracts structural information, and reports actionable lint errors.
                </p>
                <div className="feature-capabilities-grid">
                  <div className="capability-item">
                    <span className="capability-name">Parser:</span>
                    <span className="capability-val">Babel (@babel/parser)</span>
                  </div>
                  <div className="capability-item">
                    <span className="capability-name">Languages:</span>
                    <span className="capability-val">JavaScript & JSX</span>
                  </div>
                  <div className="capability-item">
                    <span className="capability-name">Linter:</span>
                    <span className="capability-val">ESLint in-memory</span>
                  </div>
                </div>
              </section>

              {/* Planned Features (Coming Soon) */}
              <section className="planned-features-section">
                <h3 className="section-heading">Planned Features</h3>
                <div className="planned-grid">
                  <div className="planned-card">
                    <div className="planned-card-header">
                      <h4 className="planned-card-title">Architecture Review</h4>
                      <span className="feature-status-pill upcoming">Coming soon</span>
                    </div>
                    <p className="planned-card-desc">
                      Planned module to analyze dependencies between files, detect circular imports,
                      and evaluate architectural layer boundaries across multi-file projects.
                    </p>
                  </div>

                  <div className="planned-card">
                    <div className="planned-card-header">
                      <h4 className="planned-card-title">Analysis History</h4>
                      <span className="feature-status-pill upcoming">Coming soon</span>
                    </div>
                    <p className="planned-card-desc">
                      Planned feature to store past analysis runs in MongoDB so you can track how code metrics
                      and lint warnings change over time.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'code-analysis' && <CodeAnalysisView />}

          {activeTab === 'architecture-review' && (
            <div className="tab-placeholder-wrapper">
              <div className="tab-placeholder-card">
                <span className="feature-status-pill upcoming">Coming Soon</span>
                <h2>Architecture Review</h2>
                <p>
                  This feature is planned for a future milestone. It will analyze module dependencies
                  and identify cross-layer violations.
                </p>
                <div className="placeholder-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setActiveTab('code-analysis')}
                  >
                    Go to Code Analysis →
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setActiveTab('overview')}
                  >
                    Back to Overview
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-placeholder-wrapper">
              <div className="tab-placeholder-card">
                <span className="feature-status-pill upcoming">Coming Soon</span>
                <h2>Analysis History</h2>
                <p>
                  This feature is currently in planning. It will allow saving and reviewing past analysis runs.
                </p>
                <div className="placeholder-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setActiveTab('code-analysis')}
                  >
                    Go to Code Analysis →
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setActiveTab('overview')}
                  >
                    Back to Overview
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
