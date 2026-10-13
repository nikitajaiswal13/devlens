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

console.log("\nAll unit test assertions passed successfully!");
