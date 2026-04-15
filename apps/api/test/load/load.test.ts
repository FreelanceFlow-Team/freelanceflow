import { describe, it, expect } from 'vitest';
import autocannon from 'autocannon';

const API_URL = process.env.LOAD_TEST_URL ?? 'http://localhost:3010';
const DURATION = 15;
const CONNECTIONS = 10;

describe('Load tests', () => {
  it('GET /api/auth/register endpoint handles load', async () => {
    const result = await autocannon({
      url: `${API_URL}/api/auth/register`,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'load@test.com',
        password: 'password123',
        firstName: 'Load',
        lastName: 'Test',
      }),
      connections: CONNECTIONS,
      duration: DURATION,
    });

    expect(result.errors).toBe(0);
    expect(result['2xx'] + result['4xx']).toBeGreaterThan(0);
    expect(result.latency.p99).toBeLessThan(2000);
  }, 30_000);

  it('GET /api/health endpoint handles load', async () => {
    const result = await autocannon({
      url: `${API_URL}/api`,
      connections: CONNECTIONS,
      duration: DURATION,
    });

    expect(result.errors).toBe(0);
    expect(result.latency.p99).toBeLessThan(500);
  }, 30_000);
});
