import React, { useState } from 'react';
import { analysisApi, ApiError } from '../services/api';
import type { CodeAnalysisResult } from '../types/analysis';

const DEFAULT_SAMPLE_CODE = `import React, { useState } from 'react';

// Example component for static inspection
export function Counter({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  const unusedMultiplier = 2; // Lint warning: unused variable

  function increment() {
    return setCount(c => c + 1);
  }

  return (
    <div className="counter-box">
      <p>Current count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}`;

export const CodeAnalysisView: React.FC = () => {
  const [filename, setFilename] = useState('example.js');
  const [code, setCode] = useState(DEFAULT_SAMPLE_CODE);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResult | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setClientError(null);
    setServerError(null);

    if (!code.trim()) {
      setClientError('Source code cannot be empty. Please enter JavaScript or JSX code.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analysisApi.analyze({
        code,
        filename: filename.trim() || 'example.js',
      });
      setAnalysisResult(result);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setServerError('Authentication session expired or invalid. Please sign in again.');
        } else {
          setServerError(err.message);
        }
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred during code analysis.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetToExample = () => {
    setCode(DEFAULT_SAMPLE_CODE);
    setFilename('example.js');
    setClientError(null);
    setServerError(null);
  };

  const handleClear = () => {
    setCode('');
    setAnalysisResult(null);
    setClientError(null);
    setServerError(null);
  };

  return (
    <div className="analysis-page-shell">
      {/* Top Header of the Analysis Workspace */}
      <section className="analysis-view-header">
        <div className="header-meta-group">
          <span className="module-chip">STATIC ANALYSIS ENGINE</span>
          <h1 className="module-title">Source Code Parser & Linter</h1>
          <p className="module-description">
            Run in-memory Babel AST parsing and ESLint static verification across modern JavaScript and JSX.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="tech-secondary-btn"
            onClick={handleResetToExample}
            disabled={isAnalyzing}
          >
            LOAD SAMPLE CODE
          </button>
          <button
            type="button"
            className="tech-secondary-btn"
            onClick={handleClear}
            disabled={isAnalyzing}
          >
            CLEAR BUFFER
          </button>
        </div>
      </section>

      {/* Input Controls Bar */}
      <div className="analysis-toolbar">
        <div className="toolbar-field">
          <label htmlFor="analysis-filename" className="toolbar-label">
            TARGET FILENAME:
          </label>
          <input
            id="analysis-filename"
            type="text"
            className="toolbar-input"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="example.js"
            disabled={isAnalyzing}
          />
        </div>

        <button
          type="button"
          className="tech-primary-btn analyze-submit-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <span className="btn-loading-state">
              <span className="terminal-busy-indicator" />
              PARSING & LINTING...
            </span>
          ) : (
            'RUN STATIC ANALYSIS →'
          )}
        </button>
      </div>

      {/* Error Notices */}
      {clientError && (
        <div className="tech-alert tech-alert-warning" role="alert">
          <span className="alert-badge-warn">WARN</span>
          <span className="alert-content">{clientError}</span>
        </div>
      )}

      {serverError && (
        <div className="tech-alert tech-alert-error" role="alert">
          <span className="alert-badge">ERR</span>
          <span className="alert-content">{serverError}</span>
        </div>
      )}

      {/* Editor & Analysis Workspace */}
      <div className="analysis-split-grid">
        {/* Left: Code Editor Pane */}
        <div className="code-editor-panel">
          <div className="editor-chrome-bar">
            <div className="file-tab active">
              <span className="file-lang-dot" />
              <span>{filename.trim() || 'snippet.js'}</span>
            </div>
            <div className="editor-stats">
              <span>{code.split(/\r\n|\r|\n/).length} lines</span>
              <span>•</span>
              <span>{new Blob([code]).size} bytes</span>
            </div>
          </div>
          <div className="textarea-editor-wrapper">
            <textarea
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste or write JavaScript / JSX source code here..."
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              disabled={isAnalyzing}
            />
          </div>
        </div>

        {/* Right: Telemetry & Findings Pane */}
        <div className="analysis-results-panel">
          {!analysisResult && !isAnalyzing && (
            <div className="empty-results-state">
              <div className="empty-state-icon">λ</div>
              <h3>No Analysis Run Yet</h3>
              <p>
                Configure the target filename and enter source code into the editor, then click
                <strong> Run Static Analysis</strong> to compute AST metrics, line counts, and actionable code quality issues.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="analyzing-state">
              <div className="terminal-busy-spinner" />
              <p className="analyzing-status">Invoking @babel/parser and ESLint verification...</p>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="results-wrapper">
              {/* Parse Status Banner */}
              <div className={`parse-status-banner ${analysisResult.parsed ? 'parsed-ok' : 'parsed-error'}`}>
                <div className="status-main">
                  <span className="status-glyph">{analysisResult.parsed ? '✓' : '✗'}</span>
                  <div>
                    <h3 className="status-heading">
                      {analysisResult.parsed ? 'AST Generation Successful' : 'Syntax Parsing Error'}
                    </h3>
                    <p className="status-sub">
                      Target: <code>{analysisResult.filename}</code> • Dialect: {analysisResult.language}
                    </p>
                  </div>
                </div>
                <div className="status-tag-pill">
                  {analysisResult.parsed ? 'AST VALID' : 'SYNTAX REJECTED'}
                </div>
              </div>

              {/* Syntax Errors Section (if any) */}
              {analysisResult.errors.length > 0 && (
                <div className="findings-section syntax-errors-block">
                  <div className="section-header-row">
                    <h4 className="findings-title error-title">SYNTAX PARSING DIAGNOSTICS</h4>
                    <span className="badge-count error-badge">{analysisResult.errors.length}</span>
                  </div>
                  <div className="findings-list">
                    {analysisResult.errors.map((err, idx) => (
                      <div key={idx} className="finding-item error-item">
                        <div className="finding-meta-row">
                          <span className="finding-loc">
                            LINE {err.line ?? '?'}, COL {err.column ?? '?'}
                          </span>
                          <span className="finding-rule-tag">{err.code}</span>
                        </div>
                        <div className="finding-message">{err.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics Summary Grid */}
              <div className="metrics-summary-box">
                <div className="section-header-row">
                  <h4 className="findings-title">AST & CODE METRICS</h4>
                </div>
                <div className="metrics-dashboard-grid">
                  <div className="metric-box">
                    <span className="m-label">LINES OF CODE</span>
                    <span className="m-val">{analysisResult.metrics.linesOfCode}</span>
                  </div>
                  <div className="metric-box">
                    <span className="m-val-cyan">{analysisResult.metrics.astNodesCount}</span>
                    <span className="m-label">AST NODES</span>
                  </div>
                  <div className="metric-box">
                    <span className="m-val-purple">{analysisResult.metrics.functions.total}</span>
                    <span className="m-label">TOTAL FUNCTIONS</span>
                    <span className="m-sub">
                      {analysisResult.metrics.functions.declarations} decl / {analysisResult.metrics.functions.arrowFunctions} arrow
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="m-val-emerald">{analysisResult.metrics.importsCount}</span>
                    <span className="m-label">IMPORTS</span>
                  </div>
                  <div className="metric-box">
                    <span className="m-val">{analysisResult.metrics.exportsCount}</span>
                    <span className="m-label">EXPORTS</span>
                  </div>
                  <div className="metric-box">
                    <span className="m-val">{analysisResult.metrics.classesCount}</span>
                    <span className="m-label">CLASSES</span>
                  </div>
                </div>
              </div>

              {/* ESLint Code Quality Issues */}
              <div className="findings-section">
                <div className="section-header-row">
                  <h4 className="findings-title">CODE QUALITY & LINT FINDINGS</h4>
                  <span className={`badge-count ${analysisResult.issues.length > 0 ? 'active-count' : 'zero-count'}`}>
                    {analysisResult.issues.length}
                  </span>
                </div>

                {analysisResult.issues.length === 0 ? (
                  <div className="clean-findings-box">
                    <span className="clean-check">✓</span>
                    <span>No actionable code quality issues detected by the active linter rules.</span>
                  </div>
                ) : (
                  <div className="findings-list">
                    {analysisResult.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`finding-item ${issue.severity === 'error' ? 'lint-error' : 'lint-warn'}`}
                      >
                        <div className="finding-meta-row">
                          <span className={`severity-tag ${issue.severity}`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="finding-rule-tag">{issue.ruleId}</span>
                          <span className="finding-loc">
                            L{issue.line}:C{issue.column}
                          </span>
                        </div>
                        <div className="finding-message">{issue.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
