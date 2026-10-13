require("dotenv").config();
const assert = require("assert");
const app = require("../../src/app");
const { signToken } = require("../../src/utils/jwt");
const User = require("../../src/models/User");

// Lightweight in-process integration test runner
async function runIntegrationTests() {
  console.log("Running Analysis API Endpoint Integration Tests...\n");

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  // Mock User.findById for JWT verification without live MongoDB connection
  const mockUserId = "507f1f77bcf86cd799439011";
  const originalFindById = User.findById;
  User.findById = (id) => ({
    select: () => Promise.resolve({
      _id: mockUserId,
      name: "Test Engineer",
      email: "engineer@devlens.io",
      toSafeObject: () => ({ id: mockUserId, name: "Test Engineer", email: "engineer@devlens.io" }),
    }),
    exec: () => Promise.resolve({
      _id: mockUserId,
      name: "Test Engineer",
      email: "engineer@devlens.io",
      toSafeObject: () => ({ id: mockUserId, name: "Test Engineer", email: "engineer@devlens.io" }),
    }),
    then: (resolve) => resolve({
      _id: mockUserId,
      name: "Test Engineer",
      email: "engineer@devlens.io",
      toSafeObject: () => ({ id: mockUserId, name: "Test Engineer", email: "engineer@devlens.io" }),
    }),
  });

  const validToken = signToken(mockUserId);

  try {
    // 1. Missing authentication token -> 401
    {
      const res = await fetch(`${baseUrl}/api/analysis/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "const x = 1;" }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 401);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, "Authentication required");
      console.log("✓ Test 1 Passed: Missing authentication token returns 401");
    }

    // 2. Invalid authentication token -> 401
    {
      const res = await fetch(`${baseUrl}/api/analysis/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid.fake.token",
        },
        body: JSON.stringify({ code: "const x = 1;" }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 401);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, "Invalid or expired token");
      console.log("✓ Test 2 Passed: Invalid authentication token returns 401");
    }

    // 3. Empty code -> 400
    {
      const res = await fetch(`${baseUrl}/api/analysis/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ code: "   " }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 400);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, "Source code cannot be empty");
      console.log("✓ Test 3 Passed: Empty source code returns 400");
    }

    // 4. Missing code field / malformed payload -> 400
    {
      const res = await fetch(`${baseUrl}/api/analysis/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 400);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, "Source code is required");
      console.log("✓ Test 4 Passed: Missing code field returns 400");
    }

    // 5. Code exceeding 100 KB size limit -> 400
    {
      const largeCode = "const a = 1;\n".repeat(8000); // ~112 KB
      const res = await fetch(`${baseUrl}/api/analysis/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ code: largeCode }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 400);
      assert.strictEqual(data.success, false);
      assert.ok(data.message.includes("exceeds maximum permitted size"));
      console.log("✓ Test 5 Passed: Exceeding 100 KB limit returns 400");
    }

    // 6. Valid JavaScript -> 200 with metrics and issues array
    {
      const jsCode = `
        import math from 'mathjs';
        export function calculateTotal(items) {
          math.abs(1);
          return items.reduce((sum, i) => sum + i.price, 0);
        }
      `;
      const res = await fetch(`${baseUrl}/api/analysis/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ code: jsCode, filename: "total.js" }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.parsed, true);
      assert.strictEqual(data.data.filename, "total.js");
      assert.strictEqual(data.data.metrics.importsCount, 1);
      assert.strictEqual(data.data.metrics.functions.total, 2);
      assert.strictEqual(data.data.errors.length, 0);
      assert.ok(Array.isArray(data.data.issues));
      console.log("✓ Test 6 Passed: Valid JavaScript returns 200 with metrics and issues array");
    }

    // 7. Valid JSX -> 200 with metrics
    {
      const jsxCode = `
        export default function App() {
          return <main className="view"><h1>DevLens</h1></main>;
        }
      `;
      const res = await fetch(`${baseUrl}/api/analysis/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ code: jsxCode, filename: "App.jsx" }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.parsed, true);
      assert.strictEqual(data.data.filename, "App.jsx");
      assert.strictEqual(data.data.metrics.exportsCount, 1);
      assert.strictEqual(data.data.errors.length, 0);
      assert.ok(Array.isArray(data.data.issues));
      console.log("✓ Test 7 Passed: Valid JSX returns 200 with metrics");
    }

    // 8. Invalid syntax -> 200 (graceful diagnostic result with line and column, empty issues)
    {
      const brokenCode = "const val = ;";
      const res = await fetch(`${baseUrl}/api/analysis/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ code: brokenCode, filename: "broken.js" }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.parsed, false);
      assert.strictEqual(data.data.errors.length, 1);
      assert.strictEqual(data.data.errors[0].line, 1);
      assert.strictEqual(data.data.errors[0].column, 12);
      assert.deepStrictEqual(data.data.issues, []);
      assert.deepStrictEqual(data.data.metrics.cyclomaticComplexity, { average: 0, max: 0 });
      assert.deepStrictEqual(data.data.metrics.functionDetails, []);
      console.log(`✓ Test 8 Passed: Syntax error reported gracefully at Line ${data.data.errors[0].line}:${data.data.errors[0].column}`);
    }

    // 9. Real code quality issue detection (unused vars & undefined refs) -> 200 with structured issues
    {
      const faultyCode = `
        const unusedValue = 100;
        export function compute() {
          return undeclaredGlobal.run();
        }
      `;
      const res = await fetch(`${baseUrl}/api/analysis/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ code: faultyCode, filename: "faulty.js" }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.parsed, true);
      assert.ok(data.data.issues.length >= 2);

      const unused = data.data.issues.find((i) => i.ruleId === "no-unused-vars");
      const undef = data.data.issues.find((i) => i.ruleId === "no-undef");

      assert.ok(unused, "Expected no-unused-vars issue in response");
      assert.ok(undef, "Expected no-undef issue in response");

      assert.strictEqual(unused.severity, "error");
      assert.strictEqual(unused.line, 2);
      assert.strictEqual(typeof unused.column, "number");
      assert.strictEqual(typeof unused.message, "string");

      assert.strictEqual(undef.severity, "error");
      assert.strictEqual(undef.line, 4);
      assert.strictEqual(typeof undef.column, "number");
      assert.strictEqual(typeof undef.message, "string");

      console.log(`✓ Test 9 Passed: Real issue detection returned structured issues for unused vars and undefined refs`);
    }

    // 10. Known cyclomatic complexity and detailed function metrics -> 200
    {
      const codeWithKnownComplexity = `
        export function processTransaction(amount, type, isVerified) {
          if (amount <= 0) {
            return false;
          }
          if (type === 'refund' || type === 'reversal') {
            return isVerified ? true : false;
          }
          return true;
        }
      `;
      const res = await fetch(`${baseUrl}/api/analysis/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ code: codeWithKnownComplexity, filename: "transaction.js" }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.parsed, true);
      assert.strictEqual(data.data.metrics.cyclomaticComplexity.average, 5);
      assert.strictEqual(data.data.metrics.cyclomaticComplexity.max, 5);
      assert.strictEqual(data.data.metrics.functionDetails.length, 1);

      const fn = data.data.metrics.functionDetails[0];
      assert.strictEqual(fn.name, "processTransaction");
      assert.strictEqual(fn.startLine, 2);
      assert.strictEqual(fn.endLine, 10);
      assert.strictEqual(fn.linesOfCode, 9);
      assert.strictEqual(fn.paramsCount, 3);
      assert.strictEqual(fn.cyclomaticComplexity, 5);
      console.log("✓ Test 10 Passed: Function with known complexity returns accurate cyclomaticComplexity and functionDetails");
    }

    // 11. Code with no functions -> 200 with zero complexity and empty functionDetails
    {
      const codeNoFunctions = `
        const config = {
          apiUrl: "https://api.devlens.io",
          timeout: 5000,
          retries: 3,
        };
        export const MAX_RETRY_COUNT = config.retries;
      `;
      const res = await fetch(`${baseUrl}/api/analysis/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ code: codeNoFunctions, filename: "config.js" }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.parsed, true);
      assert.strictEqual(data.data.metrics.functions.total, 0);
      assert.deepStrictEqual(data.data.metrics.functionDetails, []);
      assert.strictEqual(data.data.metrics.cyclomaticComplexity.average, 0);
      assert.strictEqual(data.data.metrics.cyclomaticComplexity.max, 0);
      console.log("✓ Test 11 Passed: Code with no functions returns zero complexity and empty functionDetails");
    }

    console.log("\nAll 11 API endpoint integration tests passed successfully!");
  } finally {
    User.findById = originalFindById;
    server.close();
  }
}

runIntegrationTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
