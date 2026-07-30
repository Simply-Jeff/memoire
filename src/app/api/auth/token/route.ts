import { NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const crypto = require('crypto');
    const bcrypt = require('bcryptjs');

    // Generate a secure random token
    const token = `memo_${crypto.randomBytes(32).toString('hex')}`;

    // Hash it for storage
    const tokenHash = await bcrypt.hash(token, 10);

    const newKey = await db.insert(apiKeys).values({
      name,
      userId: session.user.id,
      token: tokenHash,
    }).returning();

    // Return plain token once
    return NextResponse.json({ token }, { status: 201 });
  } catch (error) {
    console.error('Failed to create api key:', error);
    return NextResponse.json({ error: 'Failed to create api key' }, { status: 500 });
  }
}
