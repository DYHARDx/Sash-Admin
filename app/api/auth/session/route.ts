import { NextResponse } from 'next/server';

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: 'session_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // expire immediately
  });

  return response;
}
