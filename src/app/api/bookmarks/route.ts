import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookmarks } from '@/db/schema';

export async function GET() {
  try {
    const allBookmarks = await db.select().from(bookmarks).execute();
    return NextResponse.json(allBookmarks);
  } catch (error) {
    console.error('Failed to fetch bookmarks:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { url, title, description, userId } = await request.json();

    if (!url || !userId) {
      return NextResponse.json({ error: 'URL and userId are required' }, { status: 400 });
    }

    const newBookmark = await db.insert(bookmarks).values({
      url,
      title,
      description,
      userId,
    }).returning();

    return NextResponse.json(newBookmark, { status: 201 });
  } catch (error) {
    console.error('Failed to create bookmark:', error);
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
}
