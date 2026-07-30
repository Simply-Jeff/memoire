import { NextResponse } from 'next/server';
import { db } from '@/db';
import { collections } from '@/db/schema';

import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const allCollections = await db.select().from(collections).where(eq(collections.userId, session.user.id)).execute();
    return NextResponse.json(allCollections);
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const newCollection = await db.insert(collections).values({
      name,
      userId,
    }).returning();

    return NextResponse.json(newCollection[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create collection:', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}
