import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookmarks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from "@/auth";

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds must be an array' }, { status: 400 });
    }

    // In a production app you would use a transaction to batch update.
    // For simplicity with sqlite in this exercise we can await in a loop or Promise.all
    await Promise.all(
      orderedIds.map((id, index) =>
        db.update(bookmarks)
          .set({ sortOrder: index })
          .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, session.user!.id!)))
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder bookmarks:', error);
    return NextResponse.json({ error: 'Failed to reorder bookmarks' }, { status: 500 });
  }
}
