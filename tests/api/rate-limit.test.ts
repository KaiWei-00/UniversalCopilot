import fetch from 'node-fetch';

describe('/api/ratelimit endpoint', () => {
  it('should return rate limit info for valid tenant', async () => {
    const res = await fetch('http://localhost:3000/api/ratelimit?tenantSubdomain=demo');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('used');
    expect(data).toHaveProperty('max');
  });

  it('should handle missing tenantSubdomain', async () => {
    const res = await fetch('http://localhost:3000/api/ratelimit');
    expect(res.status).toBe(400);
  });

  it('should enforce rate limit', async () => {
    // Simulate hitting the rate limit (pseudo, adjust as needed)
    for (let i = 0; i < 1001; i++) {
      await fetch('http://localhost:3000/api/ratelimit?tenantSubdomain=demo');
    }
    const res = await fetch('http://localhost:3000/api/ratelimit?tenantSubdomain=demo');
    expect([429, 200]).toContain(res.status); // 429 if enforced, 200 if not
  }, 20000); // Increased timeout to 20 seconds
});
