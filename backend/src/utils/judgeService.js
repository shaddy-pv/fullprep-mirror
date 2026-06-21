/**
 * @file judgeService.js
 * @description Code execution service using Judge0 CE (https://ce.judge0.com).
 *              Free, no API key required. Same engine used by Codeforces-style platforms.
 *
 *  executeCode(language, code, stdin) → { stdout, stderr, exitCode, executionTime, isCompileError }
 *  judgeTestCase(language, code, input, expectedOutput) → { passed, stdout, stderr, expected, executionTime }
 */

const JUDGE0_API_URL = "https://ce.judge0.com";

// Judge0 CE language IDs — https://ce.judge0.com/languages
const JUDGE0_LANGUAGES = {
  CPP:        54,  // C++ (GCC 9.2.0)
  CPP17:      54,
  CPP20:      54,
  C:          50,  // C (GCC 9.2.0)
  PYTHON:     71,  // Python 3.8.1
  PYTHON3:    71,
  JAVA:       62,  // Java (OpenJDK 13)
  JAVASCRIPT: 63,  // Node.js 12.14.0
  JS:         63,
  GO:         60,  // Go 1.13.5
  RUST:       73,  // Rust 1.40.0
};

/**
 * Executes code via Judge0 CE with a given stdin input.
 * Uses base64 encoding + wait=true for synchronous results.
 *
 * @param {string} internalLang  - e.g. "CPP17", "PYTHON3", "JAVA"
 * @param {string} code          - Source code to run
 * @param {string} stdin         - Standard input
 * @param {number} timeLimitSec  - CPU time limit in seconds (default 5)
 * @returns {Promise<{stdout, stderr, exitCode, executionTime, isCompileError}>}
 */
export async function executeCode(internalLang, code, stdin, timeLimitSec = 5) {
  const langKey = (internalLang || "").toUpperCase();
  const languageId = JUDGE0_LANGUAGES[langKey];

  if (!languageId) {
    throw new Error(`Unsupported language: ${internalLang}. Supported: ${Object.keys(JUDGE0_LANGUAGES).join(", ")}`);
  }

  const payload = {
    source_code:      Buffer.from(code || "").toString("base64"),
    language_id:      languageId,
    stdin:            Buffer.from(stdin || "").toString("base64"),
    cpu_time_limit:   timeLimitSec,
    wall_time_limit:  timeLimitSec + 5,
  };

  const startTime = Date.now();

  const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
    signal:  AbortSignal.timeout((timeLimitSec + 10) * 1000),
  });

  const wallTime = Date.now() - startTime;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();

  // Decode base64 outputs
  const stdout        = result.stdout        ? Buffer.from(result.stdout,        "base64").toString().trim() : "";
  const stderr        = result.stderr        ? Buffer.from(result.stderr,        "base64").toString().trim() : "";
  const compileOutput = result.compile_output ? Buffer.from(result.compile_output, "base64").toString().trim() : "";
  const executionTime = parseFloat(result.time) * 1000 || wallTime; // Convert s → ms

  const statusId = result.status?.id;

  // Status 6 = Compilation Error
  if (statusId === 6) {
    return {
      stdout:         "",
      stderr:         compileOutput || stderr || "Compilation error",
      exitCode:       1,
      executionTime,
      isCompileError: true,
    };
  }

  // Status 5 = Time Limit Exceeded
  if (statusId === 5) {
    return {
      stdout:         stdout,
      stderr:         "Time Limit Exceeded",
      exitCode:       1,
      executionTime,
      isCompileError: false,
    };
  }

  // Status >= 7 = Runtime Error / Memory Limit / etc.
  if (statusId >= 7) {
    return {
      stdout:         stdout,
      stderr:         stderr || compileOutput || result.status?.description || "Runtime error",
      exitCode:       result.exit_code ?? 1,
      executionTime,
      isCompileError: false,
    };
  }

  // Status 3 = Accepted (successful run)
  return {
    stdout:         stdout,
    stderr:         stderr || "",
    exitCode:       result.exit_code ?? 0,
    executionTime,
    isCompileError: false,
  };
}

/**
 * Judges a single test case: runs code and compares output to expected.
 */
export async function judgeTestCase(internalLang, code, input, expectedOutput, timeLimitSec = 5) {
  const result = await executeCode(internalLang, code, input, timeLimitSec);

  const actual   = normalizeOutput(result.stdout);
  const expected = normalizeOutput(expectedOutput || "");
  const passed   = !result.isCompileError && result.exitCode === 0 && actual === expected;

  return {
    passed,
    stdout:         result.stdout,
    stderr:         result.stderr,
    exitCode:       result.exitCode,
    expected:       expectedOutput || "",
    executionTime:  result.executionTime,
    isCompileError: result.isCompileError,
  };
}

/**
 * Normalizes output for comparison (trims whitespace, normalizes line endings).
 */
function normalizeOutput(str) {
  return str
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
}
