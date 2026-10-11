import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { CodeAnalysisView } from './CodeAnalysisView';

type NavTab = 'overview' | 'code-analysis' | 'architecture-review' | 'history';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  return (
    <div className="workspace-shell">
      {/* Top Workspace Header */}
      <header className="workspace-topbar">
        <div className="topbar-left">
          <div className="workspace-logo-badge">DL</div>
          <div className="workspace-title-group">
            <span className="platform-name">DevLens</span>
            <span className="platform-slash">/</span>
            <span className="workspace-name">Core Architecture Engine</span>
          </div>
          <span className="workspace-env-tag">DEV-ENV</span>
        </div>

        <div className="topbar-right">
          <div className="telemetry-chip">
            <span className="pulse-indicator" />
            <span className="telemetry-text">BACKEND CONNECTED: PORT 5001</span>
          </div>

          <div className="user-nav-summary">
            <div className="user-text-meta">
              <span className="user-primary-name">{user?.name || 'Engineer'}</span>
              <span className="user-primary-email">{user?.email}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="workspace-signout-btn"
              title="Terminate authenticated session"
            >
              SIGN OUT
            </button>
          </div>
        </div>
      </header>

      {/* Main App Body: Sidebar + Editor/Dashboard Canvas */}
      <div className="workspace-body">
        {/* Navigation / Workbench Sidebar */}
        <aside className="workspace-sidebar">
          <div className="sidebar-group-label">ANALYSIS WORKBENCH</div>
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-tab-icon">◈</span>
              <span className="nav-tab-title">Overview</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'code-analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('code-analysis')}
            >
              <span className="nav-tab-icon">λ</span>
              <span className="nav-tab-title">Code Analysis</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn disabled-tab ${activeTab === 'architecture-review' ? 'active' : ''}`}
              onClick={() => setActiveTab('architecture-review')}
            >
              <span className="nav-tab-icon">☊</span>
              <span className="nav-tab-title">Architecture Review</span>
              <span className="tab-status-chip">COMING SOON</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn disabled-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <span className="nav-tab-icon">◷</span>
              <span className="nav-tab-title">Analysis History</span>
              <span className="tab-status-chip">COMING SOON</span>
            </button>
          </nav>

          <div className="sidebar-system-specs">
            <div className="sidebar-group-label">ENGINE SPECIFICATIONS</div>
            <div className="spec-item">
              <span className="spec-name">Runtime:</span>
              <span className="spec-val">Node v20+ / Express</span>
            </div>
            <div className="spec-item">
              <span className="spec-name">Database:</span>
              <span className="spec-val">MongoDB Atlas</span>
            </div>
            <div className="spec-item">
              <span className="spec-name">Session Token:</span>
              <span className="spec-val">sessionStorage JWT</span>
            </div>
          </div>
        </aside>

        {/* Primary Content Canvas */}
        <main className="workspace-canvas">
          {activeTab === 'overview' && (
            <div className="canvas-content-wrapper">
              {/* Welcome Section */}
              <section className="engine-hero-banner">
                <div className="hero-left-meta">
                  <div className="hero-status-tag">WORKSPACE INITIALIZED</div>
                  <h1 className="hero-heading">Welcome, {user?.name || 'Engineer'}.</h1>
                  <p className="hero-summary">
                    DevLens provides automated AST parsing, cyclic dependency detection, and architectural
                    cohesion verification for complex repositories.
                  </p>
                </div>
                <div className="hero-right-meta">
                  <div className="meta-stat-box">
                    <span className="stat-label">SESSION OPERATOR</span>
                    <span className="stat-val">{user?.email}</span>
                  </div>
                  <div className="meta-stat-box">
                    <span className="stat-label">AUTHENTICATION STATUS</span>
                    <span className="stat-val status-green">Active Bearer JWT</span>
                  </div>
                </div>
              </section>

              {/* Status and Capability Matrix */}
              <div className="workbench-grid">
                {/* Feature 1 */}
                <div className="workbench-card">
                  <div className="card-top-header">
                    <span className="card-glyph">λ</span>
                    <span className="card-phase-tag upcoming">PIPELINE STAGE 2</span>
                  </div>
                  <h3 className="card-headline">Intelligent Source Code Analysis</h3>
                  <p className="card-description">
                    Inspect AST structures, cyclomatic complexity, afferent/efferent coupling metrics, and
                    identify dead code branches across TypeScript, JavaScript, and multi-language projects.
                  </p>
                  <div className="card-metadata-list">
                    <div className="meta-row">
                      <span className="bullet">›</span>
                      <span>Abstract Syntax Tree (AST) Generation</span>
                    </div>
                    <div className="meta-row">
                      <span className="bullet">›</span>
                      <span>Cyclomatic & Cognitive Complexity Index</span>
                    </div>
                    <div className="meta-row">
                      <span className="bullet">›</span>
                      <span>Lint & Security Hotspot Heuristics</span>
                    </div>
                  </div>
                  <div className="card-action-bar">
                    <span className="engine-status-badge">Engine Module in Preparation</span>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="workbench-card">
                  <div className="card-top-header">
                    <span className="card-glyph">☊</span>
                    <span className="card-phase-tag upcoming">PIPELINE STAGE 3</span>
                  </div>
                  <h3 className="card-headline">Architecture Review & Graph Engine</h3>
                  <p className="card-description">
                    Extract internal module dependency networks, highlight illegal cross-layer violations, and
                    compute stability metrics according to clean architecture principles.
                  </p>
                  <div className="card-metadata-list">
                    <div className="meta-row">
                      <span className="bullet">›</span>
                      <span>Cross-boundary Cycle Detection</span>
                    </div>
                    <div className="meta-row">
                      <span className="bullet">›</span>
                      <span>Instability vs. Abstractness Metric Maps</span>
                    </div>
                    <div className="meta-row">
                      <span className="bullet">›</span>
                      <span>Automated Decoupling Recommendations</span>
                    </div>
                  </div>
                  <div className="card-action-bar">
                    <span className="engine-status-badge">Engine Module in Preparation</span>
                  </div>
                </div>
              </div>

              {/* Technical Code Analysis Architecture Preview */}
              <section className="architecture-preview-section">
                <div className="section-title-bar">
                  <span className="section-dot" />
                  <h3>ILLUSTRATIVE ARCHITECTURAL TELEMETRY</h3>
                  <span className="section-subtitle">(Sample Output Format)</span>
                </div>
                <div className="telemetry-table-container">
                  <table className="telemetry-table">
                    <thead>
                      <tr>
                        <th>MODULE / BOUNDARY</th>
                        <th>COUPLING (Ca / Ce)</th>
                        <th>INSTABILITY (I)</th>
                        <th>CYCLIC VIOLATIONS</th>
                        <th>ARCHITECTURAL RATING</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="code-cell">devlens/backend/src/controllers</td>
                        <td>4 / 12</td>
                        <td>0.75</td>
                        <td><span className="pill-ok">0 detected</span></td>
                        <td><span className="rating-a">GRADE A</span></td>
                      </tr>
                      <tr>
                        <td className="code-cell">devlens/backend/src/models</td>
                        <td>16 / 2</td>
                        <td>0.11</td>
                        <td><span className="pill-ok">0 detected</span></td>
                        <td><span className="rating-a">GRADE A+</span></td>
                      </tr>
                      <tr>
                        <td className="code-cell">devlens/frontend/src/services</td>
                        <td>8 / 3</td>
                        <td>0.27</td>
                        <td><span className="pill-ok">0 detected</span></td>
                        <td><span className="rating-a">GRADE A</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'code-analysis' && <CodeAnalysisView />}

          {activeTab !== 'overview' && activeTab !== 'code-analysis' && (
            <div className="placeholder-tab-view">
              <div className="placeholder-box">
                <div className="placeholder-icon">⚙</div>
                <h2>Module Under Active Construction</h2>
                <p>
                  The <strong>{activeTab.replace('-', ' ').toUpperCase()}</strong> engine will be integrated
                  in the next milestone. Repository connectors and AST visualizers are currently being structured.
                </p>
                <button
                  type="button"
                  className="tech-primary-btn compact"
                  onClick={() => setActiveTab('overview')}
                >
                  ← RETURN TO OVERVIEW
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
