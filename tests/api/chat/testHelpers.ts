import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

// Helper to mock a NextRequest for API route testing
export function mockNextRequest({ method = 'GET', body = undefined, headers = {} }: { method?: string; body?: any; headers?: Record<string, string>; }) {
  // NextRequest expects a Request object
  // We'll use the standard Request for this
  const init: RequestInit = { method, headers };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new Request('http://localhost/api/chat/conversations', init) as unknown as NextRequest;
}

// Helper to parse the NextResponse
export async function parseNextResponse(res: NextResponse) {
  const json = await res.json();
  return { status: res.status, body: json };
}
