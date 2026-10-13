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
      {/* Page Header */}
      <section className="analysis-page-header">
        <div className="analysis-header-copy">
          <h1 className="analysis-page-title">Code Analysis</h1>
          <p className="analysis-page-description">
            Inspect JavaScript and JSX source code using Babel for AST parsing and ESLint for code quality checks.
          </p>
        </div>
      </section>

      {/* Controls Bar */}
      <div className="analysis-controls-bar">
        <div className="controls-left">
          <label htmlFor="analysis-filename" className="filename-label">
            Filename:
          </label>
          <input
            id="analysis-filename"
            type="text"
            className="filename-input"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="example.js"
            disabled={isAnalyzing}
          />
        </div>

        <div className="controls-actions">
          <button
            type="button"
            className="btn-secondary small"
            onClick={handleResetToExample}
            disabled={isAnalyzing}
          >
            Load Sample Code
          </button>
          <button
            type="button"
            className="btn-secondary small"
            onClick={handleClear}
            disabled={isAnalyzing}
          >
            Clear
          </button>
          <button
            type="button"
            className="btn-primary analyze-submit-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {clientError && (
        <div className="analysis-alert warning" role="alert">
          <span className="alert-text">{clientError}</span>
        </div>
      )}

      {serverError && (
        <div className="analysis-alert error" role="alert">
          <span className="alert-text">{serverError}</span>
        </div>
      )}

      {/* Split Grid: Editor + Results */}
      <div className="analysis-split-grid">
        {/* Editor Panel */}
        <div className="code-editor-panel">
          <div className="editor-chrome-bar">
            <span className="editor-tab-label">{filename.trim() || 'snippet.js'}</span>
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

        {/* Results Panel */}
        <div className="analysis-results-panel">
          {!analysisResult && !isAnalyzing && (
            <div className="empty-results-box">
              <h3 className="empty-results-title">No Analysis Run Yet</h3>
              <p className="empty-results-text">
                Your results will appear here after analysis. Click <strong>Analyze Code</strong> to view AST metrics and detect lint issues.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="analyzing-state-box">
              <div className="analyzing-spinner" />
              <p className="analyzing-text">Analyzing source code...</p>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="results-wrapper">
              {/* Parse Status Banner */}
              <div className={`status-banner ${analysisResult.parsed ? 'success' : 'error'}`}>
                <div className="status-banner-content">
                  <span className="status-indicator-icon">{analysisResult.parsed ? '✓' : '✕'}</span>
                  <div>
                    <h3 className="status-banner-title">
                      {analysisResult.parsed ? 'Parsing Successful' : 'Syntax Error'}
                    </h3>
                    <p className="status-banner-sub">
                      File: <code>{analysisResult.filename}</code> • Language: {analysisResult.language}
                    </p>
                  </div>
                </div>
              </div>

              {/* Syntax Errors */}
              {analysisResult.errors.length > 0 && (
                <div className="results-card errors-card">
                  <div className="results-card-header">
                    <h4 className="results-card-title">Syntax Errors ({analysisResult.errors.length})</h4>
                  </div>
                  <div className="findings-list">
                    {analysisResult.errors.map((err, idx) => (
                      <div key={idx} className="finding-item error-item">
                        <div className="finding-meta">
                          <span className="finding-location">
                            Line {err.line ?? '?'}, Col {err.column ?? '?'}
                          </span>
                          {err.code && <span className="finding-tag">{err.code}</span>}
                        </div>
                        <div className="finding-message">{err.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Metrics */}
              <div className="results-card">
                <div className="results-card-header">
                  <h4 className="results-card-title">Code Metrics</h4>
                </div>
                <div className="metrics-grid">
                  <div className="metric-cell">
                    <span className="metric-label">Lines of code</span>
                    <span className="metric-value">{analysisResult.metrics.linesOfCode}</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">AST nodes</span>
                    <span className="metric-value">{analysisResult.metrics.astNodesCount}</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">Functions</span>
                    <span className="metric-value">{analysisResult.metrics.functions.total}</span>
                    <span className="metric-sub">
                      {analysisResult.metrics.functions.declarations} decl, {analysisResult.metrics.functions.arrowFunctions} arrow
                    </span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">Imports</span>
                    <span className="metric-value">{analysisResult.metrics.importsCount}</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">Exports</span>
                    <span className="metric-value">{analysisResult.metrics.exportsCount}</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">Classes</span>
                    <span className="metric-value">{analysisResult.metrics.classesCount}</span>
                  </div>
                </div>
              </div>

              {/* Function Details & Complexity */}
              <div className="results-card">
                <div className="results-card-header">
                  <h4 className="results-card-title">Function Details & Complexity</h4>
                </div>
                <div className="metrics-grid">
                  <div className="metric-cell">
                    <span className="metric-label">Total functions analyzed</span>
                    <span className="metric-value">
                      {analysisResult.metrics.functionDetails?.length ?? 0}
                    </span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">Avg cyclomatic complexity</span>
                    <span className="metric-value">
                      {typeof analysisResult.metrics.cyclomaticComplexity?.average === 'number' &&
                      !Number.isNaN(analysisResult.metrics.cyclomaticComplexity.average)
                        ? analysisResult.metrics.cyclomaticComplexity.average
                        : 0}
                    </span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">Max cyclomatic complexity</span>
                    <span className="metric-value">
                      {typeof analysisResult.metrics.cyclomaticComplexity?.max === 'number' &&
                      !Number.isNaN(analysisResult.metrics.cyclomaticComplexity.max)
                        ? analysisResult.metrics.cyclomaticComplexity.max
                        : 0}
                    </span>
                  </div>
                </div>

                {!analysisResult.metrics.functionDetails ||
                analysisResult.metrics.functionDetails.length === 0 ? (
                  <div className="no-functions-message">
                    No functions detected.
                  </div>
                ) : (
                  <div className="function-table-wrapper">
                    <table className="function-table">
                      <thead>
                        <tr>
                          <th>Function</th>
                          <th>Line Range</th>
                          <th>Lines</th>
                          <th>Params</th>
                          <th>Complexity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResult.metrics.functionDetails.map((fn, idx) => (
                          <tr key={`${fn.name}-${fn.startLine}-${idx}`}>
                            <td>
                              <span
                                className={`function-name-cell ${fn.name === '<anonymous>' ? 'anonymous' : ''}`}
                                title={fn.name}
                              >
                                {fn.name}
                              </span>
                            </td>
                            <td className="function-mono-cell">
                              {fn.startLine === fn.endLine ? `L${fn.startLine}` : `L${fn.startLine}–L${fn.endLine}`}
                            </td>
                            <td className="function-mono-cell">
                              {fn.linesOfCode}
                            </td>
                            <td className="function-mono-cell">
                              {fn.paramsCount}
                            </td>
                            <td>
                              <span className="function-complexity-badge">
                                {fn.cyclomaticComplexity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Lint & Code Quality Findings */}
              <div className="results-card">
                <div className="results-card-header">
                  <h4 className="results-card-title">Lint Findings ({analysisResult.issues.length})</h4>
                </div>

                {analysisResult.issues.length === 0 ? (
                  <div className="clean-findings-message">
                    <span className="clean-check-icon">✓</span>
                    <span>No code quality or lint issues found.</span>
                  </div>
                ) : (
                  <div className="findings-list">
                    {analysisResult.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`finding-item ${issue.severity === 'error' ? 'lint-error' : 'lint-warn'}`}
                      >
                        <div className="finding-meta">
                          <span className={`severity-badge ${issue.severity}`}>
                            {issue.severity === 'error' ? 'Error' : 'Warning'}
                          </span>
                          <span className="finding-tag">{issue.ruleId}</span>
                          <span className="finding-location">
                            Line {issue.line}, Col {issue.column}
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
