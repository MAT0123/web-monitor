import sql from '@/app/lib/neon';
import { stackServerApp } from '@/stack';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await stackServerApp.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await sql`
    SELECT * FROM websites WHERE user_id = ${user.id}
  `;

  return NextResponse.json(result);
}
