import { NextResponse } from 'next/server';

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.delete('admin_session_token');

  return response;
}
