export interface CodeAnalysisPayload {
  code: string;
  filename?: string;
}

export interface SyntaxErrorItem {
  message: string;
  line: number | null;
  column: number | null;
  code: string;
}

export interface LintIssueItem {
  ruleId: string;
  severity: 'error' | 'warning';
  message: string;
  line: number;
  column: number;
}

export interface FunctionBreakdown {
  total: number;
  declarations: number;
  expressions: number;
  arrowFunctions: number;
}

export interface CyclomaticComplexityMetrics {
  average: number;
  max: number;
}

export interface FunctionDetailItem {
  name: string;
  startLine: number;
  endLine: number;
  linesOfCode: number;
  paramsCount: number;
  cyclomaticComplexity: number;
}

export interface CodeAnalysisMetrics {
  linesOfCode: number;
  byteSize: number;
  astNodesCount: number;
  functions: FunctionBreakdown;
  cyclomaticComplexity: CyclomaticComplexityMetrics;
  functionDetails: FunctionDetailItem[];
  importsCount: number;
  exportsCount: number;
  classesCount: number;
}

export interface CodeAnalysisResult {
  success: boolean;
  parsed: boolean;
  filename: string;
  language: string;
  metrics: CodeAnalysisMetrics;
  errors: SyntaxErrorItem[];
  issues: LintIssueItem[];
}
