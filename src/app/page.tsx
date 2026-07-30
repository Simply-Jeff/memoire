import { BookmarkGrid } from "@/components/bookmarks/BookmarkGrid"
import { AddBookmarkDialog } from "@/components/bookmarks/AddBookmarkDialog"
import { db } from "@/db"
import { bookmarks } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

import { ClientSync } from "@/components/bookmarks/ClientSync"

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const { q } = await searchParams;

  let allBookmarks = [];
  if (q) {
    // In-memory filter as fallback to proper Drizzle AND/OR nesting for SQLite
    const userBookmarks = await db.select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, session.user.id))
    .execute();

    allBookmarks = userBookmarks.filter(b =>
      (b.title && b.title.toLowerCase().includes(q.toLowerCase())) ||
      (b.description && b.description.toLowerCase().includes(q.toLowerCase())) ||
      b.url.toLowerCase().includes(q.toLowerCase())
    );
  } else {
    allBookmarks = await db.select().from(bookmarks).where(eq(bookmarks.userId, session.user.id)).orderBy(desc(bookmarks.createdAt)).execute()
  }

  return (
    <div className="flex flex-col gap-6 relative min-h-[calc(100vh-6rem)]">
      <ClientSync userId={session.user.id} />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Everything</h1>
        <p className="text-muted-foreground">All your saved items in one place.</p>
      </div>

      <BookmarkGrid bookmarks={allBookmarks} />

      <AddBookmarkDialog />
    </div>
  );
}
