const { analyzeCode } = require("../../src/services/codeAnalysisService");
const assert = require("assert");

console.log("Running Code Analysis Service Unit Tests...\n");

// Test 1: Valid JavaScript without findings
{
  const code = `
    import fs from 'fs';
    export const x = 42;
    export function compute(a, b) {
      fs.readFileSync('file');
      return a + b;
    }
  `;
  const result = analyzeCode(code, "test.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.parsed, true);
  assert.strictEqual(result.errors.length, 0);
  assert.strictEqual(result.issues.length, 0);
  assert.strictEqual(result.metrics.importsCount, 1);
  assert.strictEqual(result.metrics.exportsCount, 2);
  assert.strictEqual(result.metrics.functions.total, 1);
  assert.strictEqual(result.metrics.functions.declarations, 1);
  assert.ok(result.metrics.astNodesCount > 10);
  console.log("✓ Test 1 Passed: Valid JavaScript with clean issues array");
}

// Test 2: Valid JSX syntax parsing without findings
{
  const code = `
    import React from 'react';
    export function Header({ title }) {
      return (
        <header className="main-header">
          <h1>{title}</h1>
          <nav><a href="/home">Home</a></nav>
        </header>
      );
    }
  `;
  const result = analyzeCode(code, "Header.jsx");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.parsed, true);
  assert.strictEqual(result.errors.length, 0);
  assert.strictEqual(result.metrics.functions.total, 1);
  assert.strictEqual(result.metrics.importsCount, 1);
  assert.ok(Array.isArray(result.issues));
  assert.ok(result.metrics.astNodesCount > 10);
  console.log("✓ Test 2 Passed: Valid JSX syntax parsing and clean issues");
}

// Test 3: Invalid Syntax with Line and Column details
{
  const code = `
    function broken(x) {
      const a = 1
      const b = ;
      return a + b;
    }
  `;
  const result = analyzeCode(code, "broken.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.parsed, false);
  assert.strictEqual(result.errors.length, 1);
  assert.strictEqual(result.errors[0].line, 4);
  assert.ok(typeof result.errors[0].column === "number");
  assert.ok(result.errors[0].message.length > 0);
  assert.deepStrictEqual(result.issues, []); // Parser failures do not crash and separate from linting
  console.log(`✓ Test 3 Passed: Invalid syntax reported at Line ${result.errors[0].line}, Column ${result.errors[0].column} (${result.errors[0].message})`);
}

// Test 4: Unused variable detection
{
  const code = `
    export function execute() {
      const unusedVariable = 42;
      return true;
    }
  `;
  const result = analyzeCode(code, "unused.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.parsed, true);
  assert.ok(result.issues.length >= 1);
  const unusedIssue = result.issues.find((i) => i.ruleId === "no-unused-vars");
  assert.ok(unusedIssue, "Expected no-unused-vars issue");
  assert.strictEqual(unusedIssue.severity, "error");
  assert.strictEqual(unusedIssue.line, 3);
  assert.strictEqual(unusedIssue.column, 13);
  assert.ok(unusedIssue.message.includes("unusedVariable"));
  console.log(`✓ Test 4 Passed: Unused variable detected at Line ${unusedIssue.line}:${unusedIssue.column} (${unusedIssue.message})`);
}

// Test 5: Undefined variable reference detection
{
  const code = `
    export function run() {
      return missingService.getData();
    }
  `;
  const result = analyzeCode(code, "undef.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.parsed, true);
  const undefIssue = result.issues.find((i) => i.ruleId === "no-undef");
  assert.ok(undefIssue, "Expected no-undef issue");
  assert.strictEqual(undefIssue.severity, "error");
  assert.strictEqual(undefIssue.line, 3);
  assert.strictEqual(undefIssue.column, 14);
  assert.ok(undefIssue.message.includes("missingService"));
  console.log(`✓ Test 5 Passed: Undefined reference detected at Line ${undefIssue.line}:${undefIssue.column} (${undefIssue.message})`);
}

// Test 6: Unreachable code and suspicious warnings
{
  const code = `
    export function unreachableExample() {
      const val = 10;
      return val;
      const dead = 20;
    }
  `;
  const result = analyzeCode(code, "unreachable.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.parsed, true);
  const unreachableIssue = result.issues.find((i) => i.ruleId === "no-unreachable");
  assert.ok(unreachableIssue, "Expected no-unreachable issue");
  assert.strictEqual(unreachableIssue.severity, "error");
  assert.strictEqual(unreachableIssue.line, 5);
  console.log(`✓ Test 6 Passed: Unreachable code detected at Line ${unreachableIssue.line}:${unreachableIssue.column}`);
}

// Test 7: Distinguishing warnings from errors
{
  const code = `
    export function checkQuality(a) {
      debugger;
      if (a == 5) {
        return true;
      }
      return false;
    }
  `;
  const result = analyzeCode(code, "warn.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.parsed, true);
  const warningIssue = result.issues.find((i) => i.severity === "warning");
  assert.ok(warningIssue, "Expected at least one warning severity issue");
  assert.ok(result.issues.some((i) => i.ruleId === "no-debugger"));
  console.log(`✓ Test 7 Passed: Successfully distinguished warning [${warningIssue.ruleId}] with severity='warning'`);
}

// Test 8: Simple function (complexity = 1, line count, paramsCount)
{
  const code = `
    function greet(name) {
      return "Hello, " + name;
    }
  `;
  const result = analyzeCode(code, "simple.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.parsed, true);
  assert.strictEqual(result.metrics.functionDetails.length, 1);
  const fn = result.metrics.functionDetails[0];
  assert.strictEqual(fn.name, "greet");
  assert.strictEqual(fn.paramsCount, 1);
  assert.strictEqual(fn.cyclomaticComplexity, 1);
  assert.strictEqual(fn.startLine, 2);
  assert.strictEqual(fn.endLine, 4);
  assert.strictEqual(fn.linesOfCode, 3);
  assert.strictEqual(result.metrics.cyclomaticComplexity.average, 1);
  assert.strictEqual(result.metrics.cyclomaticComplexity.max, 1);
  console.log("✓ Test 8 Passed: Simple function baseline complexity and line/param counts");
}

// Test 9: Conditional branches (if, else if, ternary)
{
  const code = `
    function evaluateScore(score) {
      if (score >= 90) {
        return "A";
      } else if (score >= 80) {
        return "B";
      } else {
        return score >= 70 ? "C" : "F";
      }
    }
  `;
  const result = analyzeCode(code, "branches.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.metrics.functionDetails.length, 1);
  const fn = result.metrics.functionDetails[0];
  assert.strictEqual(fn.name, "evaluateScore");
  assert.strictEqual(fn.cyclomaticComplexity, 4); // 1 base + 1 if + 1 else if + 1 ternary
  assert.strictEqual(result.metrics.cyclomaticComplexity.max, 4);
  assert.strictEqual(result.metrics.cyclomaticComplexity.average, 4);
  console.log("✓ Test 9 Passed: Conditional branches (if, else-if, ternary) increment complexity correctly");
}

// Test 10: Loop statements
{
  const code = `
    function processCollections(items, config) {
      for (let i = 0; i < items.length; i++) {}
      for (const item of items) {}
      for (const key in config) {}
      while (items.length > 0) {}
      do {} while (false);
    }
  `;
  const result = analyzeCode(code, "loops.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.metrics.functionDetails.length, 1);
  const fn = result.metrics.functionDetails[0];
  assert.strictEqual(fn.name, "processCollections");
  assert.strictEqual(fn.paramsCount, 2);
  assert.strictEqual(fn.cyclomaticComplexity, 6); // 1 base + 5 loops
  assert.strictEqual(result.metrics.cyclomaticComplexity.max, 6);
  console.log("✓ Test 10 Passed: Loop constructs (for, for-of, for-in, while, do-while) increment complexity");
}

// Test 11: Switch cases (non-default increment, default does not)
{
  const code = `
    function getStatusMessage(status) {
      switch (status) {
        case 200:
          return "OK";
        case 404:
          return "Not Found";
        case 500:
          return "Server Error";
        default:
          return "Unknown";
      }
    }
  `;
  const result = analyzeCode(code, "switch.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.metrics.functionDetails.length, 1);
  const fn = result.metrics.functionDetails[0];
  assert.strictEqual(fn.name, "getStatusMessage");
  assert.strictEqual(fn.cyclomaticComplexity, 4); // 1 base + 3 non-default cases (default ignored)
  console.log("✓ Test 11 Passed: Switch non-default cases increment complexity while default case is excluded");
}

// Test 12: Logical branching operators (&&, ||, ??)
{
  const code = `
    const checkPermissions = (user, role, fallback, isSuper) => {
      const allowed = (user && role) || (fallback ?? false);
      return allowed && isSuper;
    };
  `;
  const result = analyzeCode(code, "logical.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.metrics.functionDetails.length, 1);
  const fn = result.metrics.functionDetails[0];
  assert.strictEqual(fn.name, "checkPermissions");
  assert.strictEqual(fn.paramsCount, 4);
  assert.strictEqual(fn.cyclomaticComplexity, 5); // 1 base + 2 (&&) + 1 (||) + 1 (??)
  console.log("✓ Test 12 Passed: Logical operators (&&, ||, ??) increment complexity accurately");
}

// Test 13: Exception handling catch clause
{
  const code = `
    function parsePayload(raw) {
      try {
        return JSON.parse(raw);
      } catch (err) {
        return null;
      }
    }
  `;
  const result = analyzeCode(code, "catch.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.metrics.functionDetails.length, 1);
  const fn = result.metrics.functionDetails[0];
  assert.strictEqual(fn.name, "parsePayload");
  assert.strictEqual(fn.cyclomaticComplexity, 2); // 1 base + 1 catch
  console.log("✓ Test 13 Passed: Catch clause increments complexity");
}

// Test 14: Anonymous functions vs named expressions/methods
{
  const code = `
    const actions = {
      doWork(a, b) {
        return a + b;
      },
      handler: function(e) {
        return e;
      }
    };
    [1, 2].map((x) => x * 2);
    (function() {
      return true;
    })();
  `;
  const result = analyzeCode(code, "anon.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.metrics.functionDetails.length, 4);
  assert.strictEqual(result.metrics.functionDetails[0].name, "doWork");
  assert.strictEqual(result.metrics.functionDetails[0].paramsCount, 2);
  assert.strictEqual(result.metrics.functionDetails[1].name, "handler");
  assert.strictEqual(result.metrics.functionDetails[1].paramsCount, 1);
  assert.strictEqual(result.metrics.functionDetails[2].name, "<anonymous>");
  assert.strictEqual(result.metrics.functionDetails[2].paramsCount, 1);
  assert.strictEqual(result.metrics.functionDetails[3].name, "<anonymous>");
  assert.strictEqual(result.metrics.functionDetails[3].paramsCount, 0);
  console.log("✓ Test 14 Passed: Proper resolution of method names and anonymous functions");
}

// Test 15: Nested function complexity isolation
{
  const code = `
    function outer(items) {
      if (!items) {
        return [];
      }
      return items.filter(function innerFilter(item) {
        if (item.active && item.score > 50) {
          return true;
        }
        return false;
      });
    }
  `;
  const result = analyzeCode(code, "nested.js");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.metrics.functionDetails.length, 2);

  const outerFn = result.metrics.functionDetails.find((f) => f.name === "outer");
  const innerFn = result.metrics.functionDetails.find((f) => f.name === "innerFilter");

  assert.ok(outerFn);
  assert.ok(innerFn);

  // Outer function only has 1 if statement: complexity 2 (1 base + 1 if)
  assert.strictEqual(outerFn.cyclomaticComplexity, 2);

  // Inner function has 1 if statement and 1 &&: complexity 3 (1 base + 1 if + 1 &&)
  assert.strictEqual(innerFn.cyclomaticComplexity, 3);

  // Average: (2 + 3) / 2 = 2.5
  assert.strictEqual(result.metrics.cyclomaticComplexity.average, 2.5);
  assert.strictEqual(result.metrics.cyclomaticComplexity.max, 3);
  console.log("✓ Test 15 Passed: Nested function decisions strictly isolated from outer function");
}

// Test 16: Zero functions and syntax error defaults
{
  const codeNoFunctions = `
    const a = 10;
    const b = 20;
    const c = a + b;
  `;
  const resultNoFn = analyzeCode(codeNoFunctions, "nofn.js");
  assert.strictEqual(resultNoFn.success, true);
  assert.strictEqual(resultNoFn.metrics.functionDetails.length, 0);
  assert.strictEqual(resultNoFn.metrics.cyclomaticComplexity.average, 0);
  assert.strictEqual(resultNoFn.metrics.cyclomaticComplexity.max, 0);

  const brokenCode = "const err = ;";
  const resultBroken = analyzeCode(brokenCode, "err.js");
  assert.strictEqual(resultBroken.parsed, false);
  assert.deepStrictEqual(resultBroken.metrics.functionDetails, []);
  assert.deepStrictEqual(resultBroken.metrics.cyclomaticComplexity, { average: 0, max: 0 });
  console.log("✓ Test 16 Passed: Zero functions and syntax errors safely return 0/empty metrics");
}

console.log("\nAll unit test assertions passed successfully!");

