import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tags } from '@/db/schema';

import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const allTags = await db.select().from(tags).where(eq(tags.userId, session.user.id)).execute();
    return NextResponse.json(allTags);
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
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

    const newTag = await db.insert(tags).values({
      name,
      userId,
    }).returning();

    return NextResponse.json(newTag[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
