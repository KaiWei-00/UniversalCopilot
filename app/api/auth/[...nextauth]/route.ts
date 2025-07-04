import NextAuth from "next-auth";
import { authOptions } from "./authOptions";

const handler = NextAuth(authOptions);

// Custom wrapper to force JSON error for credentials sign-in failures
import { NextRequest } from 'next/server';

async function customHandler(req: NextRequest, ctx: any) {
  console.log('customHandler called', req.method, req.nextUrl.pathname, {
    accept: req.headers.get('accept'),
    xrw: req.headers.get('x-requested-with')
  });
  console.log('customHandler called', req.method, req.nextUrl.pathname);
  const res = await handler(req, ctx);

  // Only intercept POST to /callback/credentials
  if (
    req.method === 'POST' &&
    req.nextUrl.pathname.endsWith('/api/auth/callback/credentials') &&
    (req.headers.get('accept') || '').includes('application/json') || req.headers.get('x-requested-with') === 'XMLHttpRequest'
  ) {
    // If NextAuth returns a redirect (302), check if it is an error redirect
    if (res.status === 302) {
      const location = res.headers.get('location') || '';
      if (location.includes('/error')) {
        // Failed login: return JSON error
        return new Response(JSON.stringify({ error: 'CredentialsSignin' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // Successful login: return JSON indicating success
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      const isCredentialsCallback = req.nextUrl.pathname.endsWith('/api/auth/callback/credentials');
      const isFailure =
        !json ||
        (typeof json === 'object' && Object.keys(json).length === 0) ||
        (json && typeof json === 'object' && 'error' in json && json.error) ||
        (isCredentialsCallback && (!json.ok && !json.user));

      if (isFailure) {
        return new Response(JSON.stringify({ error: 'CredentialsSignin' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // If NextAuth returned a user or ok:true, treat as success
      if ((json && json.ok === true) || (json && json.user)) {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Fallback: return original JSON
      return new Response(text, {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      // If response is not JSON (e.g. HTML), treat as error
      return new Response(JSON.stringify({ error: 'CredentialsSignin' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  // Default: return original response
  return res;
}

export { customHandler as POST, handler as GET };

