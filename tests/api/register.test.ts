import fetch from 'node-fetch';

describe('/api/tenant registration', () => {
  it('should register a new tenant with valid data', async () => {
    const unique = Math.random().toString(36).substring(2, 8);
    const res = await fetch('http://localhost:3000/api/tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `TestOrg${unique}`,
        subdomain: `testorg${unique}`,
        contactEmail: `admin${unique}@test.com`,
        rateLimitTier: 'free',
        maxRequestsPerHour: 1000,
        adminEmail: `admin${unique}@test.com`,
        adminPassword: 'StrongPassword123!'
      })
    });
    expect([200, 201]).toContain(res.status);
  });

  it('should fail with missing fields', async () => {
    const res = await fetch('http://localhost:3000/api/tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Missing' })
    });
    expect(res.status).toBe(400);
  });

  it('should fail with duplicate subdomain', async () => {
    // Register once
    const unique = Math.random().toString(36).substring(2, 8);
    await fetch('http://localhost:3000/api/tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `DupOrg${unique}`,
        subdomain: `dupsub${unique}`,
        contactEmail: `dup${unique}@test.com`,
        rateLimitTier: 'free',
        maxRequestsPerHour: 1000,
        adminEmail: `dup${unique}@test.com`,
        adminPassword: 'StrongPassword123!'
      })
    });
    // Register again with same subdomain
    const res = await fetch('http://localhost:3000/api/tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `DupOrg${unique}`,
        subdomain: `dupsub${unique}`,
        contactEmail: `dup${unique}@test.com`,
        rateLimitTier: 'free',
        maxRequestsPerHour: 1000,
        adminEmail: `dup${unique}@test.com`,
        adminPassword: 'StrongPassword123!'
      })
    });
    expect(res.status).toBe(409);
  });
});
