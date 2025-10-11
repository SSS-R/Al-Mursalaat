import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  // Set the cookie with an expiration date in the past to delete it
  response.cookies.set('sessionToken', '', { expires: new Date(0), path: '/' });
  return response;
}