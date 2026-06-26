import http from 'k6/http';
import { check, sleep } from 'k6';

// Read configuration from environment variables
const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 10;
const DURATION = __ENV.DURATION || '10s';
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const FRONTEND_URL = __ENV.FRONTEND_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '5s', target: VUS },   // Ramp up
    { duration: '20s', target: VUS },  // Stay at peak load for 20s
    { duration: '5s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // Error rate should be less than 5%
    http_req_duration: ['p(95)<300'], // We expect p(95) response time to be under 300ms after cache optimization!
  },
};

// setup() runs once at the beginning of the load test
export function setup() {
  const tokens = [];
  const headers = { 'Content-Type': 'application/json' };
  
  // Pre-register and pre-login a pool of 20 test users sequentially
  for (let i = 0; i < 20; i++) {
    const email = `loadtest_vu_user_${i}@fullprepbench.com`;
    const name = `LoadTest VU User ${i}`;
    const password = 'TestPassword123!';
    
    const loginPayload = JSON.stringify({ email, password });
    let res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, { headers });
    
    if (res.status === 200) {
      tokens.push(res.json().token);
    } else {
      // If login fails (user does not exist), register them
      const registerPayload = JSON.stringify({ name, email, password });
      res = http.post(`${BASE_URL}/api/auth/register`, registerPayload, { headers });
      if (res.status === 201) {
        tokens.push(res.json().token);
      }
    }
  }
  
  console.log(`Successfully initialized a token pool of ${tokens.length} users for the load test.`);
  
  if (tokens.length > 0) {
    console.log("Pre-warming backend in-memory caches sequentially…");
    for (let i = 0; i < tokens.length; i++) {
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens[i]}`,
      };
      // Pre-warm stats cache
      http.get(`${BASE_URL}/api/auth/stats`, { headers: authHeaders });
      // Pre-warm notifications cache
      http.get(`${BASE_URL}/api/notifications`, { headers: authHeaders });
      // Pre-warm profile/token cache
      http.get(`${BASE_URL}/api/auth/me`, { headers: authHeaders });
    }
    
    // Warm up shared caches (leaderboard, problems, and specific problem details)
    const sharedHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens[0]}`,
    };
    http.get(`${BASE_URL}/api/auth/leaderboard`, { headers: sharedHeaders });
    
    const problemsRes = http.get(`${BASE_URL}/api/problems`, { headers: sharedHeaders });
    if (problemsRes.status === 200) {
      const body = problemsRes.json();
      if (body && body.data && body.data.length > 0) {
        const firstProbId = body.data[0]._id;
        http.get(`${BASE_URL}/api/problems/${firstProbId}`, { headers: sharedHeaders });
      }
    }
    console.log("Backend in-memory caches successfully pre-warmed!");
  }
  
  return { tokens };
}

export default function (data) {
  // Pick a token from the pool based on Virtual User ID
  const tokens = data.tokens;
  const token = tokens[__VU % tokens.length];

  // ── Scenario 1: Guest traffic (always hit the frontend/landing page unless skipped)
  if (__ENV.SKIP_FRONTEND !== 'true') {
    const landingRes = http.get(FRONTEND_URL);
    check(landingRes, {
      'landing page load 200': (r) => r.status === 200,
    });
    sleep(0.5);
  }

  // If we have an authentication token from the pool, perform API requests
  if (token) {
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Parallel-like request sequence (dashboard API panel loads) using HTTP batch
    const responses = http.batch([
      ['GET', `${BASE_URL}/api/auth/me`, null, { headers: authHeaders }],
      ['GET', `${BASE_URL}/api/auth/stats`, null, { headers: authHeaders }],
      ['GET', `${BASE_URL}/api/notifications`, null, { headers: authHeaders }],
      ['GET', `${BASE_URL}/api/auth/leaderboard`, null, { headers: authHeaders }],
    ]);

    check(responses[0], {
      'get profile returns 200': (r) => r.status === 200,
    });
    check(responses[1], {
      'get stats returns 200': (r) => r.status === 200,
    });
    check(responses[2], {
      'get notifications returns 200': (r) => r.status === 200,
    });
    check(responses[3], {
      'get leaderboard returns 200': (r) => r.status === 200,
    });

    // Browse problems list
    const problemsRes = http.get(`${BASE_URL}/api/problems`, { headers: authHeaders });
    const problemsOk = check(problemsRes, {
      'get problems list returns 200': (r) => r.status === 200,
    });

    // View specific problem details if list is not empty
    if (problemsOk) {
      const body = problemsRes.json();
      if (body && body.data && body.data.length > 0) {
        const firstProb = body.data[0];
        const probId = firstProb._id;
        const problemRes = http.get(`${BASE_URL}/api/problems/${probId}`, { headers: authHeaders });
        check(problemRes, {
          'get single problem returns 200': (r) => r.status === 200,
        });
      }
    }
  }

  // Think time between loops
  sleep(2);
}
