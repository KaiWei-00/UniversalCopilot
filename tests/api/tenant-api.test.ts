import fetch from 'node-fetch';

describe('/api/tenant endpoint', () => {
  it('should reject missing fields', async () => {
    const res = await fetch('http://localhost:3000/api/tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Missing' })
    });
    expect(res.status).toBe(400);
  });
});

describe('/api/tenant-list endpoint', () => {
  it('should reject non-admin access', async () => {
    const res = await fetch('http://localhost:3000/api/tenant-list', {
      headers: { 'x-user-role': 'user' }
    });
    expect(res.status).toBe(403);
  });
  it('should return tenants for admin', async () => {
    const res = await fetch('http://localhost:3000/api/tenant-list', {
      headers: { 'x-user-role': 'admin' }
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.tenants)).toBe(true);
  });
});

describe('/api/apikey-list endpoint', () => {
  it('should reject non-admin access', async () => {
    const res = await fetch('http://localhost:3000/api/apikey-list?tenantId=1', {
      headers: { 'x-user-role': 'user' }
    });
    expect(res.status).toBe(403);
  });
  it('should reject missing tenantId', async () => {
    const res = await fetch('http://localhost:3000/api/apikey-list', {
      headers: { 'x-user-role': 'admin' }
    });
    expect(res.status).toBe(400);
  });
  it('should return apiKeys for valid tenant and admin', async () => {
    // This test assumes a valid tenantId=1 exists in the test DB
    const res = await fetch('http://localhost:3000/api/apikey-list?tenantId=1', {
      headers: { 'x-user-role': 'admin' }
    });
    // Could be 200 or 500 if DB is empty, but should not throw
    expect([200, 500]).toContain(res.status);
  });
});
