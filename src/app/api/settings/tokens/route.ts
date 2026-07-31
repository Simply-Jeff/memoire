import { NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { auth } from "@/auth";
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate a random plain token
    const plainToken = crypto.randomBytes(32).toString('hex');

    // Hash it for DB storage
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');

    await db.insert(apiKeys).values({
      userId: session.user.id,
      name,
      token: tokenHash
    });

    return NextResponse.json({ token: plainToken }, { status: 201 });
  } catch (error) {
    console.error('Failed to create API token:', error);
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
  }
}
