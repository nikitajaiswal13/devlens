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
 * Determines whether an AST node represents a callable function or method.
 */
function isFunctionNode(node) {
  if (!node || typeof node !== "object") {
    return false;
  }
  return (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression" ||
    node.type === "ClassMethod" ||
    node.type === "ClassPrivateMethod" ||
    node.type === "ObjectMethod"
  );
}

/**
 * Resolves the name of a function node using its identifier or immediate parent context.
 * Falls back to "<anonymous>" when an explicit name is unavailable.
 */
function getFunctionName(node, parent) {
  // 1. Explicit identifier on function (FunctionDeclaration or named FunctionExpression)
  if (node.id && typeof node.id.name === "string") {
    return node.id.name;
  }

  // 2. Class or Object method key
  if (node.key) {
    if (node.key.type === "Identifier" && typeof node.key.name === "string") {
      return node.key.name;
    }
    if (node.key.type === "PrivateIdentifier" && typeof node.key.name === "string") {
      return `#${node.key.name}`;
    }
    if (node.key.type === "StringLiteral" && typeof node.key.value === "string") {
      return node.key.value;
    }
  }

  // 3. Parent context (variable declaration, assignment, or object property)
  if (parent) {
    if (parent.type === "VariableDeclarator" && parent.id && parent.id.type === "Identifier") {
      return parent.id.name;
    }

    if (parent.type === "AssignmentExpression") {
      if (parent.left && parent.left.type === "Identifier") {
        return parent.left.name;
      }
      if (
        parent.left &&
        parent.left.type === "MemberExpression" &&
        parent.left.property &&
        parent.left.property.type === "Identifier" &&
        !parent.left.computed
      ) {
        return parent.left.property.name;
      }
    }

    if (parent.type === "ObjectProperty" && parent.key) {
      if (parent.key.type === "Identifier") {
        return parent.key.name;
      }
      if (parent.key.type === "StringLiteral") {
        return parent.key.value;
      }
    }

    if (parent.type === "AssignmentPattern" && parent.left && parent.left.type === "Identifier") {
      return parent.left.name;
    }
  }

  return "<anonymous>";
}

/**
 * Computes McCabe cyclomatic complexity for a given function node.
 * Starts at base 1 and increments for conditional branches, loops, non-default switch cases,
 * catch clauses, and logical operators (&&, ||, ??).
 * Strictly isolates nested functions so inner decisions are never counted toward the enclosing function.
 */
function calculateFunctionComplexity(fnNode) {
  let complexity = 1;

  function walk(node) {
    if (!node || typeof node !== "object") {
      return;
    }

    // Strictly isolate nested functions: do not descend into child function scopes
    if (node !== fnNode && isFunctionNode(node)) {
      return;
    }

    if (node !== fnNode) {
      if (node.type === "IfStatement" || node.type === "ConditionalExpression") {
        complexity += 1;
      } else if (
        node.type === "ForStatement" ||
        node.type === "ForInStatement" ||
        node.type === "ForOfStatement" ||
        node.type === "WhileStatement" ||
        node.type === "DoWhileStatement"
      ) {
        complexity += 1;
      } else if (node.type === "SwitchCase" && node.test !== null) {
        complexity += 1;
      } else if (node.type === "CatchClause") {
        complexity += 1;
      } else if (
        node.type === "LogicalExpression" &&
        (node.operator === "&&" || node.operator === "||" || node.operator === "??")
      ) {
        complexity += 1;
      }
    }

    for (const key of Object.keys(node)) {
      if (key === "loc" || key === "comments" || key === "tokens" || key === "extra") {
        continue;
      }
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === "object" && typeof item.type === "string") {
            walk(item);
          }
        }
      } else if (child && typeof child === "object" && typeof child.type === "string") {
        walk(child);
      }
    }
  }

  walk(fnNode);
  return complexity;
}

/**
 * Traverses an AST object and executes a visitor callback on each Node.
 * Safe, iterative or recursive traversal without executing or evaluating code.
 */
function traverseAst(node, visitor, parent = null) {
  if (!node || typeof node !== "object") {
    return;
  }

  if (typeof node.type === "string") {
    visitor(node, parent);
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
          traverseAst(item, visitor, node);
        }
      }
    } else if (child && typeof child === "object" && typeof child.type === "string") {
      traverseAst(child, visitor, node);
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
    const functionDetails = [];

    traverseAst(ast, (node, parent) => {
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

      if (isFunctionNode(node)) {
        const fnName = getFunctionName(node, parent);
        const startLine = node.loc ? node.loc.start.line : 1;
        const endLine = node.loc ? node.loc.end.line : 1;
        const linesOfCode = Math.max(1, endLine - startLine + 1);
        const paramsCount = Array.isArray(node.params) ? node.params.length : 0;
        const fnComplexity = calculateFunctionComplexity(node);

        functionDetails.push({
          name: fnName,
          startLine,
          endLine,
          linesOfCode,
          paramsCount,
          cyclomaticComplexity: fnComplexity,
        });
      }
    });

    const totalFunctions = functionDetails.length;
    const totalComplexity = functionDetails.reduce((sum, fn) => sum + fn.cyclomaticComplexity, 0);
    const avgComplexity = totalFunctions > 0 ? Number((totalComplexity / totalFunctions).toFixed(2)) : 0;
    const maxComplexity = totalFunctions > 0 ? Math.max(...functionDetails.map((fn) => fn.cyclomaticComplexity)) : 0;

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
        cyclomaticComplexity: {
          average: avgComplexity,
          max: maxComplexity,
        },
        functionDetails,
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
        cyclomaticComplexity: {
          average: 0,
          max: 0,
        },
        functionDetails: [],
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
