const parser = require("@babel/parser");
const { Linter } = require("eslint");
const globals = require("globals");

const linter = new Linter();

const LINTER_CONFIG = {
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2021,
    },
  },
  rules: {
    // Variable correctness
    "no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: true,
      },
    ],
    "no-undef": "error",

    // Code execution & logic correctness
    "no-unreachable": "error",
    "no-constant-condition": ["warn", { checkLoops: false }],
    "no-self-compare": "error",
    "no-dupe-keys": "error",
    "no-dupe-args": "error",
    "no-duplicate-case": "error",

    // Suspicious patterns / best practices
    "no-empty": ["warn", { allowEmptyCatch: true }],
    "no-debugger": "warn",
    "eqeqeq": ["warn", "smart"],
    "no-sparse-arrays": "warn",
  },
};

/**
 * Traverses an AST object and executes a visitor callback on each Node.
 * Safe, iterative or recursive traversal without executing or evaluating code.
 */
function traverseAst(node, visitor) {
  if (!node || typeof node !== "object") {
    return;
  }

  if (typeof node.type === "string") {
    visitor(node);
  }

  for (const key of Object.keys(node)) {
    // Avoid traversing parent references or non-node properties
    if (key === "loc" || key === "comments" || key === "tokens") {
      continue;
    }
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === "object" && typeof item.type === "string") {
          traverseAst(item, visitor);
        }
      }
    } else if (child && typeof child === "object" && typeof child.type === "string") {
      traverseAst(child, visitor);
    }
  }
}

/**
 * Normalizes ESLint linter messages into DevLens issue structures.
 */
function lintCode(code) {
  if (typeof code !== "string" || !code.trim()) {
    return [];
  }

  try {
    const rawMessages = linter.verify(code, LINTER_CONFIG);

    const issues = [];
    for (const msg of rawMessages) {
      // If ESLint encountered a fatal parsing error, skip it here so syntax parsing
      // diagnostics remain strictly handled by Babel Parser.
      if (msg.fatal || !msg.ruleId) {
        continue;
      }

      issues.push({
        ruleId: msg.ruleId,
        severity: msg.severity === 2 ? "error" : "warning",
        message: msg.message,
        line: typeof msg.line === "number" ? msg.line : 1,
        column: typeof msg.column === "number" ? msg.column : 1,
      });
    }

    return issues;
  } catch {
    // In-memory linting must never crash the service
    return [];
  }
}

/**
 * Parses and analyzes JavaScript / JSX source code.
 *
 * @param {string} code - The source code to parse.
 * @param {string} [filename="snippet.js"] - Optional file label.
 * @returns {object} Analysis result containing metrics, syntax errors, and lint issues.
 */
function analyzeCode(code, filename = "snippet.js") {
  const lineCount = typeof code === "string" ? code.split(/\r\n|\r|\n/).length : 0;
  const byteSize = typeof code === "string" ? Buffer.byteLength(code, "utf8") : 0;

  try {
    const ast = parser.parse(code, {
      sourceType: "unambiguous",
      allowReturnOutsideFunction: true,
      allowImportExportEverywhere: true,
      allowAwaitOutsideFunction: true,
      allowSuperOutsideMethod: true,
      errorRecovery: false,
      plugins: [
        "jsx",
        "classProperties",
        "classPrivateProperties",
        "classPrivateMethods",
        "optionalChaining",
        "nullishCoalescingOperator",
        "objectRestSpread",
        "dynamicImport",
        "topLevelAwait",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "numericSeparator",
      ],
    });

    let totalNodes = 0;
    let functionDeclarations = 0;
    let functionExpressions = 0;
    let arrowFunctions = 0;
    let imports = 0;
    let exports = 0;
    let classDeclarations = 0;

    traverseAst(ast, (node) => {
      totalNodes += 1;

      switch (node.type) {
        case "FunctionDeclaration":
          functionDeclarations += 1;
          break;
        case "FunctionExpression":
          functionExpressions += 1;
          break;
        case "ArrowFunctionExpression":
          arrowFunctions += 1;
          break;
        case "ImportDeclaration":
          imports += 1;
          break;
        case "ExportNamedDeclaration":
        case "ExportDefaultDeclaration":
        case "ExportAllDeclaration":
          exports += 1;
          break;
        case "ClassDeclaration":
        case "ClassExpression":
          classDeclarations += 1;
          break;
        default:
          break;
      }
    });

    // Run ESLint rule verification for actionable issues
    const issues = lintCode(code);

    return {
      success: true,
      parsed: true,
      filename,
      language: "javascript",
      metrics: {
        linesOfCode: lineCount,
        byteSize,
        astNodesCount: totalNodes,
        functions: {
          total: functionDeclarations + functionExpressions + arrowFunctions,
          declarations: functionDeclarations,
          expressions: functionExpressions,
          arrowFunctions,
        },
        importsCount: imports,
        exportsCount: exports,
        classesCount: classDeclarations,
      },
      errors: [],
      issues,
    };
  } catch (error) {
    const line = error.loc ? error.loc.line : null;
    const column = error.loc ? error.loc.column : null;
    const errorReason = error.reasonCode || error.code || "SYNTAX_ERROR";

    return {
      success: true, // Analysis completed gracefully and produced diagnostic findings
      parsed: false,
      filename,
      language: "javascript",
      metrics: {
        linesOfCode: lineCount,
        byteSize,
        astNodesCount: 0,
        functions: {
          total: 0,
          declarations: 0,
          expressions: 0,
          arrowFunctions: 0,
        },
        importsCount: 0,
        exportsCount: 0,
        classesCount: 0,
      },
      errors: [
        {
          message: error.message ? error.message.replace(/\s*\(\d+:\d+\)$/, "") : "Syntax parsing error",
          line,
          column,
          code: errorReason,
        },
      ],
      issues: [],
    };
  }
}

module.exports = {
  analyzeCode,
};
