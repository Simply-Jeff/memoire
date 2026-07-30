import { NextResponse } from 'next/server';
import { db } from '@/db';
import { eq, like, or } from 'drizzle-orm';
import { bookmarks } from '@/db/schema';
import { enqueueMetadataExtraction } from '@/lib/queue';

import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let allBookmarks;
    if (query) {
      const searchPattern = `%${query}%`;

      // In-memory filter as fallback to proper Drizzle AND/OR nesting for SQLite
      const userBookmarks = await db.select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, session.user.id))
      .execute();

      allBookmarks = userBookmarks.filter(b =>
        (b.title && b.title.toLowerCase().includes(query.toLowerCase())) ||
        (b.description && b.description.toLowerCase().includes(query.toLowerCase())) ||
        b.url.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      allBookmarks = await db.select().from(bookmarks).where(eq(bookmarks.userId, session.user.id)).execute();
    }

    return NextResponse.json(allBookmarks);
  } catch (error) {
    console.error('Failed to fetch bookmarks:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

import { apiKeys } from '@/db/schema';

export async function POST(request: Request) {
  try {
    // Check for API token first
    const authHeader = request.headers.get('Authorization');
    let userId;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      const allKeys = await db.select().from(apiKeys).execute();
      const bcrypt = require('bcryptjs');

      let matchedKey = null;
      for (const k of allKeys) {
        if (await bcrypt.compare(token, k.token)) {
          matchedKey = k;
          break;
        }
      }

      if (!matchedKey) {
        return NextResponse.json({ error: 'Invalid API Token' }, { status: 401 });
      }
      userId = matchedKey.userId;
    } else {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = session.user.id;
    }

    const { url, collection, tags } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Pass along user tags and collections implicitly by storing it in metadata for now
    // We could store it properly in relations, but keeping it simple for metadata JSONB.
    const metadataObj = {
      collection: collection || null,
      tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
    };

    // Insert immediately, but with empty metadata.
    // The background worker will populate it.
    const newBookmark = await db.insert(bookmarks).values({
      url,
      userId,
      metadata: JSON.stringify(metadataObj)
    }).returning();

    // Enqueue job
    await enqueueMetadataExtraction(url, newBookmark[0].id);

    // If we have an existing WebSocket client or logic, we can broadcast here.
    // For simplicity, relying on polling or external push.

    return NextResponse.json(newBookmark[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create bookmark:', error);
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
}
