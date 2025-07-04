import fetch from 'node-fetch';

it('should authenticate with valid credentials', async () => {
  const res = await fetch('http://localhost:3000/api/auth/callback/credentials?redirect=false', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify({
      email: 'admin@demo.com',
      password: 'password',
      tenant: 'demo',
      redirect: false
    })
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch (e) {
    throw new Error('Response was not JSON. Raw response:\n' + text);
  }
  // Accept either { ok: true } or no error
  expect(body.error).toBeUndefined();
  expect(body.ok === true || body.ok === undefined).toBe(true);
});


