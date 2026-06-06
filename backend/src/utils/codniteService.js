/**
 * @file codniteService.js
 * @description HTTP client wrapper for the Codnite Problem API.
 *              Deployed on Render: https://codnite-problem-api.onrender.com
 *
 *  All functions throw a plain Error with a descriptive message on failure.
 *  Controllers catch these and pass them to the global error handler.
 *
 *  Note: Render free-tier spins down after inactivity (cold starts ~30s).
 *        The 30s timeout handles this gracefully.
 */

const CODNITE_BASE =
  process.env.CODNITE_API_URL || "https://codnite-problem-api.onrender.com";

const TIMEOUT_MS = 30_000; // 30 seconds — accounts for Render cold starts

// ── Internal Helper ───────────────────────────────────────────────────────────

/**
 * Performs a GET request to the Codnite API with a timeout.
 * @param {string} path  - API path e.g. "/api/problems"
 * @param {object} [params] - Query parameters as key-value pairs
 * @returns {Promise<any>} Parsed JSON response
 */
const codniteGet = async (path, params = {}) => {
  const url = new URL(CODNITE_BASE + path);

  // Append query params, filtering out undefined/null values
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Codnite API error [${res.status}]: ${body.slice(0, 200)}`
      );
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(
        "Codnite API request timed out. The server may be starting up — please retry in a moment."
      );
    }
    throw err;
  }
};

// ── Public API Functions ──────────────────────────────────────────────────────

/**
 * Fetch a paginated, filtered list of problems from the Codnite index.
 *
 * @param {object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @param {string} [options.source]       - e.g. "CODEFORCES"
 * @param {string} [options.difficulty]   - e.g. "EASY"
 * @param {string} [options.tag]          - e.g. "dp"
 * @param {number} [options.minRating]
 * @param {number} [options.maxRating]
 * @param {string} [options.sortBy]       - "name" | "cf_rating" | "difficulty"
 * @param {string} [options.sortOrder]    - "asc" | "desc"
 * @returns {Promise<object>} { total, page, limit, total_pages, problems: [...] }
 */
export const fetchProblems = (options = {}) => {
  const {
    page, limit, source, difficulty, tag,
    minRating, maxRating, sortBy, sortOrder,
  } = options;

  return codniteGet("/api/problems", {
    page,
    limit,
    source,
    difficulty,
    tag,
    min_rating: minRating,
    max_rating: maxRating,
    sort_by:    sortBy,
    sort_order: sortOrder,
  });
};

/**
 * Fetch full problem details by Codnite problem ID.
 * Includes description, public_tests, private_tests, generated_tests, solutions.
 *
 * @param {string} problemId - Codnite external ID e.g. "1579_a__casimir_s_string_solitaire_8c8fe87e"
 * @returns {Promise<object>} Full problem object
 */
export const fetchProblemById = (problemId) =>
  codniteGet(`/api/problems/${encodeURIComponent(problemId)}`);

/**
 * Fetch test cases for a problem.
 *
 * @param {string} problemId
 * @param {string} [testType="all"] - "public" | "private" | "generated" | "all"
 * @returns {Promise<object>}
 */
export const fetchProblemTests = (problemId, testType = "all") =>
  codniteGet(`/api/problems/${encodeURIComponent(problemId)}/tests`, {
    test_type: testType,
  });

/**
 * Fetch solutions for a problem.
 *
 * @param {string} problemId
 * @param {string} [language] - Filter by language e.g. "PYTHON3"
 * @returns {Promise<object>}
 */
export const fetchProblemSolutions = (problemId, language) =>
  codniteGet(`/api/problems/${encodeURIComponent(problemId)}/solutions`, {
    language,
  });

/**
 * Search problems by name / description / tags.
 *
 * @param {string} query    - Search query string
 * @param {number} [limit=20]
 * @returns {Promise<object>} { query, total_results, results: [...] }
 */
export const fetchSearch = (query, limit = 20) =>
  codniteGet("/api/search", { q: query, limit });

/**
 * Get a random problem, optionally filtered.
 *
 * @param {object} [filters]
 * @param {string} [filters.source]
 * @param {string} [filters.difficulty]
 * @param {string} [filters.tag]
 * @returns {Promise<object>} Full problem object
 */
export const fetchRandomProblem = (filters = {}) =>
  codniteGet("/api/random", filters);

/**
 * Get all tags with their problem counts.
 * @returns {Promise<object>} { total_tags, tags: [{ name, count }] }
 */
export const fetchTags = () => codniteGet("/api/tags");

/**
 * Get all sources with their problem counts.
 * @returns {Promise<object>} { sources: [{ name, count }] }
 */
export const fetchSources = () => codniteGet("/api/sources");

/**
 * Get database statistics from Codnite.
 * @returns {Promise<object>}
 */
export const fetchStats = () => codniteGet("/api/stats");

export default {
  fetchProblems,
  fetchProblemById,
  fetchProblemTests,
  fetchProblemSolutions,
  fetchSearch,
  fetchRandomProblem,
  fetchTags,
  fetchSources,
  fetchStats,
};
