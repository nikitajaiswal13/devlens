import React from 'react';

export const CodeAnalysisPreview: React.FC = () => {
  return (
    <div className="preview-terminal">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="dot dot-red" />
          <span className="dot dot-amber" />
          <span className="dot dot-green" />
        </div>
        <div className="terminal-title">
          <span className="terminal-icon">λ</span>
          <span>devlens://analyzer/ast-viewer.ts</span>
        </div>
        <div className="terminal-badge">SAMPLE VIEW</div>
      </div>

      <div className="terminal-workspace">
        <div className="editor-sidebar-strip">
          <div className="strip-item active" title="AST Inspection">AST</div>
          <div className="strip-item" title="Module Graph">MOD</div>
          <div className="strip-item" title="Call Trees">CALL</div>
        </div>

        <div className="editor-code-pane">
          <div className="editor-tab-bar">
            <span className="editor-tab active">
              <span className="file-icon ts-icon">TS</span>
              AuthService.ts
            </span>
            <span className="editor-tab">
              <span className="file-icon mod-icon">M</span>
              DependencyGraph.json
            </span>
          </div>

          <div className="code-content">
            <div className="code-line">
              <span className="line-num">01</span>
              <span className="kw">export class</span> <span className="entity">ArchitectureEngine</span> {'{'}
            </div>
            <div className="code-line">
              <span className="line-num">02</span>
              <span className="indent">  </span>
              <span className="kw">private readonly</span> <span className="prop">astCache</span> = <span className="kw">new</span> <span className="entity">Map</span>();
            </div>
            <div className="code-line">
              <span className="line-num">03</span>
              <span className="indent">  </span>
            </div>
            <div className="code-line">
              <span className="line-num">04</span>
              <span className="indent">  </span>
              <span className="kw">public async</span> <span className="fn">inspectBoundary</span>(<span className="arg">sourceFile</span>: <span className="type">SourceFile</span>) {'{'}
            </div>
            <div className="code-line">
              <span className="line-num">05</span>
              <span className="indent">    </span>
              <span className="kw">const</span> <span className="prop">imports</span> = <span className="kw">await</span> <span className="prop">sourceFile</span>.<span className="fn">extractImports</span>();
            </div>
            <div className="code-line">
              <span className="line-num">06</span>
              <span className="indent">    </span>
              <span className="cm">// Validate cross-boundary domain constraints</span>
            </div>
            <div className="code-line highlight-line">
              <span className="line-num">07</span>
              <span className="indent">    </span>
              <span className="kw">return this</span>.<span className="fn">detectCircularCycles</span>(<span className="prop">imports</span>);
            </div>
            <div className="code-line">
              <span className="line-num">08</span>
              <span className="indent">  </span>
              {'}'}
            </div>
            <div className="code-line">
              <span className="line-num">09</span>
              {'}'}
            </div>
          </div>

          <div className="sample-metrics-panel">
            <div className="metrics-header">
              <span className="metric-tag">STATIC ANALYSIS METRICS (ILLUSTRATIVE PREVIEW)</span>
              <span className="metric-status">Rule Engine v1.4</span>
            </div>
            <div className="metrics-grid">
              <div className="metric-cell">
                <span className="cell-label">CYCLOMATIC COMPLEXITY</span>
                <span className="cell-value cyan-val">3.2 <span className="cell-sub">Optimal (&lt; 10)</span></span>
              </div>
              <div className="metric-cell">
                <span className="cell-label">CIRCULAR DEPS</span>
                <span className="cell-value emerald-val">0 <span className="cell-sub">Clean Boundary</span></span>
              </div>
              <div className="metric-cell">
                <span className="cell-label">AFFERENT COUPLING</span>
                <span className="cell-value purple-val">14 <span className="cell-sub">High Stability</span></span>
              </div>
              <div className="metric-cell">
                <span className="cell-label">DEVIATION INDEX</span>
                <span className="cell-value cyan-val">0.02 <span className="cell-sub">Strict Layering</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="terminal-footer">
        <span className="footer-item"><span className="status-dot-ok" /> AST Parser: Ready</span>
        <span className="footer-item">Dialect: TypeScript 5.8 / ESNext</span>
        <span className="footer-item note-item">Illustrative architectural telemetry</span>
      </div>
    </div>
  );
};
